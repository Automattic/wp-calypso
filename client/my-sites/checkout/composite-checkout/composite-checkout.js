/**
 * External dependencies
 */
import page from 'page';
import wp from 'lib/wp';
import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import debugFactory from 'debug';
import { useSelector, useDispatch, useStore } from 'react-redux';
import WPCheckout from 'my-sites/checkout/composite-checkout/components/wp-checkout';
import { useWpcomStore } from 'my-sites/checkout/composite-checkout/hooks/wpcom-store';
import { areDomainsInLineItems } from 'my-sites/checkout/composite-checkout/hooks/has-domains';
import {
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
} from 'my-sites/checkout/composite-checkout/types/wpcom-store-state';
import { CheckoutProvider, checkoutTheme, defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { getProductsList, isProductsListFetching } from 'state/products-list/selectors';
import {
	useStoredCards,
	useIsApplePayAvailable,
	filterAppropriatePaymentMethods,
} from './payment-method-helpers';
import usePrepareProductsForCart, {
	useFetchProductsIfNotLoaded,
} from './use-prepare-product-for-cart';
import notices from 'notices';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isPrivateSite from 'state/selectors/is-private-site';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { StateSelect } from 'my-sites/domains/components/form';
import { getPlan } from 'lib/plans';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { useStripe } from 'lib/stripe';
import CheckoutTerms from '../checkout/checkout-terms.jsx';
import useShowStripeLoadingErrors from './use-show-stripe-loading-errors';
import useCreatePaymentMethods from './use-create-payment-methods';
import {
	applePayProcessor,
	freePurchaseProcessor,
	multiPartnerCardProcessor,
	fullCreditsProcessor,
	existingCardProcessor,
	payPalProcessor,
	genericRedirectProcessor,
} from './payment-method-processors';
import { useGetThankYouUrl } from './use-get-thank-you-url';
import createAnalyticsEventHandler from './record-analytics';
import { fillInSingleCartItemAttributes } from 'lib/cart-values';
import { hasRenewalItem, getRenewalItems, hasPlan } from 'lib/cart-values/cart-items';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryPlans from 'components/data/query-plans';
import QueryProducts from 'components/data/query-products-list';
import { clearPurchases } from 'state/purchases/actions';
import { fetchReceiptCompleted } from 'state/receipts/actions';
import { requestSite } from 'state/sites/actions';
import { fetchSitesAndUser } from 'lib/signup/step-actions/fetch-sites-and-user';
import { getDomainNameFromReceiptOrCart } from 'lib/domains/cart-utils';
import { AUTO_RENEWAL } from 'lib/url/support';
import { useLocalizedMoment } from 'components/localized-moment';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { retrieveSignupDestination, clearSignupDestinationCookie } from 'signup/utils';
import { useProductVariants } from './hooks/product-variants';
import { CartProvider } from './cart-provider';
import { translateResponseCartToWPCOMCart } from './lib/translate-cart';
import useShoppingCartManager from './hooks/use-shopping-cart-manager';
import useShowAddCouponSuccessMessage from './hooks/use-show-add-coupon-success-message';
import useCountryList from './hooks/use-country-list';
import { colors } from '@automattic/color-studio';
import { needsDomainDetails } from 'my-sites/checkout/composite-checkout/payment-method-helpers';
import { isGSuiteProductSlug } from 'lib/gsuite';
import useCachedDomainContactDetails from './hooks/use-cached-domain-contact-details';
import useDisplayErrors from './hooks/use-display-errors';

const debug = debugFactory( 'calypso:composite-checkout:composite-checkout' );

const { select, dispatch, registerStore } = defaultRegistry;

const wpcom = wp.undocumented();

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcomGetCart = ( ...args ) => wpcom.getCart( ...args );
const wpcomSetCart = ( ...args ) => wpcom.setCart( ...args );
const wpcomGetStoredCards = ( ...args ) => wpcom.getStoredCards( ...args );

export default function CompositeCheckout( {
	siteSlug,
	siteId,
	product,
	getCart,
	setCart,
	getStoredCards,
	allowedPaymentMethods,
	onlyLoadPaymentMethods,
	overrideCountryList,
	redirectTo,
	feature,
	plan,
	purchaseId,
	cart,
	couponCode: couponCodeFromUrl,
	isComingFromUpsell,
	isLoggedOutCart,
	isNoSiteCart,
	infoMessage,
} ) {
	const translate = useTranslate();
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const isLoadingCartSynchronizer =
		cart && ( ! cart.hasLoadedFromServer || cart.hasPendingServerUpdates );
	const hideNudge = isComingFromUpsell;
	const createUserAndSiteBeforeTransaction = isLoggedOutCart || isNoSiteCart;
	const transactionOptions = { createUserAndSiteBeforeTransaction };
	const reduxDispatch = useDispatch();
	const recordEvent = useCallback( createAnalyticsEventHandler( reduxDispatch ), [] ); // eslint-disable-line react-hooks/exhaustive-deps

	const showErrorMessage = useCallback(
		( error ) => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ) );
		},
		[ translate ]
	);

	const showErrorMessageBriefly = useCallback(
		( error ) => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ), {
				duration: 5000,
			} );
		},
		[ translate ]
	);

	const showInfoMessage = useCallback( ( message ) => {
		debug( 'info', message );
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( ( message ) => {
		debug( 'success', message );
		notices.success( message );
	}, [] );

	const showAddCouponSuccessMessage = ( couponCode ) => {
		showSuccessMessage(
			translate( "The '%(couponCode)s' coupon was successfully applied to your shopping cart.", {
				args: { couponCode },
			} )
		);
	};

	useShowStripeLoadingErrors( showErrorMessage, stripeLoadingError );

	const countriesList = useCountryList( overrideCountryList || [] );

	const { productsForCart, canInitializeCart } = usePrepareProductsForCart( {
		siteId,
		product,
		purchaseId,
		isJetpackNotAtomic,
		isPrivate,
	} );

	useFetchProductsIfNotLoaded();
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );

	const {
		removeItem,
		couponStatus,
		submitCoupon,
		removeCoupon,
		updateLocation,
		changeItemVariant,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		responseCart,
		loadingError,
		addItem,
		variantSelectOverride,
	} = useShoppingCartManager( {
		cartKey: isLoggedOutCart || isNoSiteCart ? siteSlug : siteId,
		canInitializeCart: canInitializeCart && ! isLoadingCartSynchronizer && ! isFetchingProducts,
		productsToAddOnInitialize: productsForCart,
		couponToAddOnInitialize: couponCodeFromUrl,
		setCart: setCart || wpcomSetCart,
		getCart: getCart || wpcomGetCart,
		onEvent: recordEvent,
	} );

	const {
		items,
		tax,
		coupon: couponItem,
		total,
		credits,
		subtotal,
		allowedPaymentMethods: serverAllowedPaymentMethods,
	} = useMemo( () => translateResponseCartToWPCOMCart( responseCart ), [ responseCart ] );

	useShowAddCouponSuccessMessage(
		couponStatus === 'applied',
		couponItem?.wpcom_meta?.couponCode ?? '',
		showAddCouponSuccessMessage
	);

	const errors = responseCart.messages?.errors ?? [];

	const getThankYouUrl = useGetThankYouUrl( {
		siteSlug,
		redirectTo,
		purchaseId,
		feature,
		cart: responseCart,
		isJetpackNotAtomic,
		product,
		siteId,
		hideNudge,
		recordEvent,
		isLoggedOutCart,
	} );

	const moment = useLocalizedMoment();
	const isDomainOnly = useSelector( ( state ) => isDomainOnlySite( state, siteId ) );
	const reduxStore = useStore();

	const onPaymentComplete = useCallback(
		( { paymentMethodId } ) => {
			debug( 'payment completed successfully' );
			const url = getThankYouUrl();
			recordEvent( {
				type: 'PAYMENT_COMPLETE',
				payload: { url, couponItem, paymentMethodId, total, responseCart },
			} );

			const transactionResult = select( 'wpcom' ).getTransactionResult();
			const receiptId = transactionResult?.receipt_id;
			debug( 'transactionResult was', transactionResult );

			reduxDispatch( clearPurchases() );

			// Removes the destination cookie only if redirecting to the signup destination.
			// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
			const destinationFromCookie = retrieveSignupDestination();
			if ( url.includes( destinationFromCookie ) ) {
				debug( 'clearing redirect url cookie' );
				clearSignupDestinationCookie();
			}

			if ( hasRenewalItem( responseCart ) && transactionResult?.purchases ) {
				debug( 'purchase had a renewal' );
				displayRenewalSuccessNotice( responseCart, transactionResult.purchases, translate, moment );
			}

			if ( receiptId && transactionResult?.purchases && transactionResult?.failed_purchases ) {
				debug( 'fetching receipt' );
				reduxDispatch( fetchReceiptCompleted( receiptId, transactionResult ) );
			}

			if ( siteId ) {
				reduxDispatch( requestSite( siteId ) );
			}

			if (
				( responseCart.create_new_blog &&
					Object.keys( transactionResult?.purchases ?? {} ).length > 0 &&
					Object.keys( transactionResult?.failed_purchases ?? {} ).length === 0 ) ||
				( isDomainOnly && hasPlan( responseCart ) && ! siteId )
			) {
				notices.info( translate( 'Almost done…' ) );

				const domainName = getDomainNameFromReceiptOrCart( transactionResult, responseCart );

				if ( domainName ) {
					debug( 'purchase needs to fetch before redirect', domainName );
					fetchSitesAndUser(
						domainName,
						() => {
							page.redirect( url );
						},
						reduxStore
					);

					return;
				}
			}

			debug( 'just redirecting to', url );

			if ( createUserAndSiteBeforeTransaction ) {
				window.localStorage.removeItem( 'shoppingCart' );
				window.localStorage.removeItem( 'siteParams' );

				// We use window.location instead of page.redirect() so that the cookies are detected on fresh page load.
				// Using page.redirect() will take to the log in page which we don't want.
				window.location = url;
				return;
			}

			page.redirect( url );
		},
		[
			reduxStore,
			isDomainOnly,
			moment,
			reduxDispatch,
			siteId,
			recordEvent,
			translate,
			getThankYouUrl,
			total,
			couponItem,
			responseCart,
			createUserAndSiteBeforeTransaction,
		]
	);

	useWpcomStore(
		registerStore,
		recordEvent,
		applyContactDetailsRequiredMask(
			emptyManagedContactDetails,
			areDomainsInLineItems( items ) ? domainRequiredContactDetails : taxRequiredContactDetails
		),
		updateContactDetailsCache
	);

	useDetectedCountryCode();
	useCachedDomainContactDetails( updateLocation );

	useDisplayErrors( [ ...errors, loadingError ].filter( Boolean ), showErrorMessage );

	const isFullCredits = credits?.amount.value > 0 && credits?.amount.value >= subtotal.amount.value;
	const itemsForCheckout = ( items.length
		? [ ...items, tax, couponItem, ...( isFullCredits ? [] : [ credits ] ) ]
		: []
	).filter( Boolean );
	debug( 'items for checkout', itemsForCheckout );

	let cartEmptyRedirectUrl = `/plans/${ siteSlug || '' }`;

	if ( createUserAndSiteBeforeTransaction ) {
		const siteSlugLoggedOutCart = select( 'wpcom' )?.getSiteSlug();
		cartEmptyRedirectUrl = siteSlugLoggedOutCart ? `/plans/${ siteSlugLoggedOutCart }` : '/start';
	}

	useRedirectIfCartEmpty(
		items,
		cartEmptyRedirectUrl,
		isLoadingCart,
		[ ...errors, loadingError ].filter( Boolean ),
		createUserAndSiteBeforeTransaction
	);

	const { storedCards, isLoading: isLoadingStoredCards } = useStoredCards(
		getStoredCards || wpcomGetStoredCards,
		recordEvent,
		isLoggedOutCart
	);

	const {
		canMakePayment: isApplePayAvailable,
		isLoading: isApplePayLoading,
	} = useIsApplePayAvailable( stripe, stripeConfiguration, !! stripeLoadingError, items );

	const paymentMethodObjects = useCreatePaymentMethods( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		credits,
		isApplePayAvailable,
		isApplePayLoading,
		storedCards,
		siteSlug,
	} );
	debug( 'created payment method objects', paymentMethodObjects );

	// Once we pass paymentMethods into CompositeCheckout, we should try to avoid
	// changing them because it can cause awkward UX. Here we try to wait for
	// them to be all finished loading before we pass them along.
	const arePaymentMethodsLoading =
		items.length < 1 ||
		isLoadingCart ||
		isLoadingStoredCards ||
		( onlyLoadPaymentMethods
			? onlyLoadPaymentMethods.includes( 'apple-pay' ) && isApplePayLoading
			: isApplePayLoading );

	const paymentMethods = arePaymentMethodsLoading
		? []
		: filterAppropriatePaymentMethods( {
				paymentMethodObjects,
				total,
				credits,
				subtotal,
				allowedPaymentMethods,
				serverAllowedPaymentMethods,
		  } );
	debug( 'filtered payment method objects', paymentMethods );

	const getItemVariants = useProductVariants( {
		siteId,
		productSlug: getPlanProductSlugs( items )[ 0 ],
	} );

	const { analyticsPath, analyticsProps } = getAnalyticsPath(
		purchaseId,
		product,
		siteSlug,
		feature,
		plan
	);

	const products = useSelector( ( state ) => getProductsList( state ) );

	// Often products are added using just the product_slug but missing the
	// product_id; this adds it.
	const addItemWithEssentialProperties = useCallback(
		( cartItem ) => addItem( fillInSingleCartItemAttributes( cartItem, products ) ),
		[ addItem, products ]
	);

	const includeDomainDetails = needsDomainDetails( responseCart );
	const includeGSuiteDetails = items.some( ( item ) =>
		isGSuiteProductSlug( item.wpcom_meta?.product_slug )
	);
	const dataForProcessor = useMemo(
		() => ( {
			includeDomainDetails,
			includeGSuiteDetails,
		} ),
		[ includeDomainDetails, includeGSuiteDetails ]
	);
	const dataForRedirectProcessor = useMemo(
		() => ( {
			...dataForProcessor,
			getThankYouUrl,
			siteSlug,
		} ),
		[ dataForProcessor, getThankYouUrl, siteSlug ]
	);

	const paymentProcessors = useMemo(
		() => ( {
			'apple-pay': ( transactionData ) =>
				applePayProcessor( transactionData, dataForProcessor, transactionOptions ),
			'free-purchase': ( transactionData ) =>
				freePurchaseProcessor( transactionData, dataForProcessor ),
			card: ( transactionData ) =>
				multiPartnerCardProcessor( transactionData, dataForProcessor, transactionOptions ),
			alipay: ( transactionData ) =>
				genericRedirectProcessor( 'alipay', transactionData, dataForRedirectProcessor ),
			p24: ( transactionData ) =>
				genericRedirectProcessor( 'p24', transactionData, dataForRedirectProcessor ),
			bancontact: ( transactionData ) =>
				genericRedirectProcessor( 'bancontact', transactionData, dataForRedirectProcessor ),
			giropay: ( transactionData ) =>
				genericRedirectProcessor( 'giropay', transactionData, dataForRedirectProcessor ),
			wechat: ( transactionData ) =>
				genericRedirectProcessor( 'wechat', transactionData, dataForRedirectProcessor ),
			netbanking: ( transactionData ) =>
				genericRedirectProcessor( 'netbanking', transactionData, dataForRedirectProcessor ),
			ideal: ( transactionData ) =>
				genericRedirectProcessor( 'ideal', transactionData, dataForRedirectProcessor ),
			sofort: ( transactionData ) =>
				genericRedirectProcessor( 'sofort', transactionData, dataForRedirectProcessor ),
			eps: ( transactionData ) =>
				genericRedirectProcessor( 'eps', transactionData, dataForRedirectProcessor ),
			'ebanx-tef': ( transactionData ) =>
				genericRedirectProcessor( 'brazil-tef', transactionData, dataForRedirectProcessor ),
			'full-credits': ( transactionData ) =>
				fullCreditsProcessor( transactionData, dataForProcessor, transactionOptions ),
			'existing-card': ( transactionData ) =>
				existingCardProcessor( transactionData, dataForProcessor, transactionOptions ),
			paypal: ( transactionData ) =>
				payPalProcessor(
					transactionData,
					{ ...dataForProcessor, getThankYouUrl, couponItem },
					transactionOptions
				),
		} ),
		[ couponItem, dataForProcessor, dataForRedirectProcessor, getThankYouUrl, transactionOptions ]
	);

	useRecordCheckoutLoaded(
		recordEvent,
		isLoadingCart,
		isApplePayAvailable,
		isApplePayLoading,
		responseCart,
		storedCards,
		isLoadingStoredCards,
		product
	);

	const jetpackColors = isJetpackNotAtomic
		? {
				primary: colors[ 'Jetpack Green' ],
				primaryBorder: colors[ 'Jetpack Green 80' ],
				primaryOver: colors[ 'Jetpack Green 60' ],
				success: colors[ 'Jetpack Green' ],
				discount: colors[ 'Jetpack Green' ],
				highlight: colors[ 'Blue 50' ],
				highlightBorder: colors[ 'Blue 80' ],
				highlightOver: colors[ 'Blue 60' ],
		  }
		: {};
	const theme = { ...checkoutTheme, colors: { ...checkoutTheme.colors, ...jetpackColors } };

	const isLoading =
		isLoadingCart || isLoadingStoredCards || paymentMethods.length < 1 || items.length < 1;
	if ( isLoading ) {
		debug( 'still loading because one of these is true', {
			isLoadingCart,
			isLoadingStoredCards,
			paymentMethods: paymentMethods.length < 1,
			arePaymentMethodsLoading: arePaymentMethodsLoading,
			items: items.length < 1,
		} );
	}

	return (
		<React.Fragment>
			<QuerySitePlans siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			<QueryPlans />
			<QueryProducts />
			<QueryContactDetailsCache />
			<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />
			<CartProvider cart={ responseCart }>
				<CheckoutProvider
					items={ itemsForCheckout }
					total={ total }
					onPaymentComplete={ onPaymentComplete }
					showErrorMessage={ showErrorMessage }
					showInfoMessage={ showInfoMessage }
					showSuccessMessage={ showSuccessMessage }
					onEvent={ recordEvent }
					paymentMethods={ paymentMethods }
					paymentProcessors={ paymentProcessors }
					registry={ defaultRegistry }
					isLoading={ isLoading }
					isValidating={ isCartPendingUpdate }
					theme={ theme }
				>
					<WPCheckout
						removeItem={ removeItem }
						updateLocation={ updateLocation }
						submitCoupon={ submitCoupon }
						removeCoupon={ removeCoupon }
						couponStatus={ couponStatus }
						changePlanLength={ changeItemVariant }
						siteId={ siteId }
						siteUrl={ siteSlug }
						countriesList={ countriesList }
						StateSelect={ StateSelect }
						variantSelectOverride={ variantSelectOverride }
						getItemVariants={ getItemVariants }
						responseCart={ responseCart }
						addItemToCart={ addItemWithEssentialProperties }
						subtotal={ subtotal }
						isCartPendingUpdate={ isCartPendingUpdate }
						CheckoutTerms={ CheckoutTerms }
						showErrorMessageBriefly={ showErrorMessageBriefly }
						isLoggedOutCart={ isLoggedOutCart }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						infoMessage={ infoMessage }
					/>
				</CheckoutProvider>
			</CartProvider>
		</React.Fragment>
	);
}

CompositeCheckout.propTypes = {
	siteSlug: PropTypes.string,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	product: PropTypes.string,
	getCart: PropTypes.func,
	setCart: PropTypes.func,
	getStoredCards: PropTypes.func,
	allowedPaymentMethods: PropTypes.array,
	redirectTo: PropTypes.string,
	feature: PropTypes.string,
	plan: PropTypes.string,
	cart: PropTypes.object,
	transaction: PropTypes.object,
};

function useRedirectIfCartEmpty(
	items,
	redirectUrl,
	isLoading,
	errors,
	createUserAndSiteBeforeTransaction
) {
	useEffect( () => {
		if ( ! isLoading && items.length === 0 && errors.length === 0 ) {
			debug( 'cart is empty and not still loading; redirecting...' );
			if ( createUserAndSiteBeforeTransaction ) {
				window.localStorage.removeItem( 'shoppingCart' );
				window.localStorage.removeItem( 'siteParams' );

				// We use window.location instead of page.redirect() so that if the user already has an account and site at
				// this point, then window.location will reload with the cookies applied and takes to the /plans page.
				// (page.redirect() will take to the log in page instead).
				window.location = redirectUrl;
				return;
			}
			page.redirect( redirectUrl );
			return;
		}
	}, [ redirectUrl, items, isLoading, errors, createUserAndSiteBeforeTransaction ] );
}

function useRecordCheckoutLoaded(
	recordEvent,
	isLoadingCart,
	isApplePayAvailable,
	isApplePayLoading,
	responseCart,
	storedCards,
	isLoadingStoredCards,
	product
) {
	const hasRecordedCheckoutLoad = useRef( false );
	if (
		! isLoadingCart &&
		! isLoadingStoredCards &&
		! isApplePayLoading &&
		! hasRecordedCheckoutLoad.current
	) {
		debug( 'composite checkout has loaded' );
		recordEvent( {
			type: 'CHECKOUT_LOADED',
			payload: {
				saved_cards: storedCards.length,
				apple_pay_available: isApplePayAvailable,
				product_slug: product,
				is_renewal: hasRenewalItem( responseCart ),
			},
		} );
		hasRecordedCheckoutLoad.current = true;
	}
}

function useDetectedCountryCode() {
	const detectedCountryCode = useSelector( getCurrentUserCountryCode );
	const refHaveUsedDetectedCountryCode = useRef( false );

	useEffect( () => {
		// Dispatch exactly once
		if ( detectedCountryCode && ! refHaveUsedDetectedCountryCode.current ) {
			debug( 'using detected country code "' + detectedCountryCode + '"' );
			dispatch( 'wpcom' ).loadCountryCodeFromGeoIP( detectedCountryCode );
			refHaveUsedDetectedCountryCode.current = true;
		}
	}, [ detectedCountryCode ] );
}

function getPlanProductSlugs(
	items // : WPCOMCart
) /* : WPCOMCartItem[] */ {
	return items
		.filter( ( item ) => {
			return item.type !== 'tax' && getPlan( item.wpcom_meta.product_slug );
		} )
		.map( ( item ) => item.wpcom_meta.product_slug );
}

function getAnalyticsPath( purchaseId, product, selectedSiteSlug, selectedFeature, plan ) {
	debug( 'getAnalyticsPath', { purchaseId, product, selectedSiteSlug, selectedFeature, plan } );
	let analyticsPath = '';
	let analyticsProps = {};
	if ( purchaseId && product ) {
		analyticsPath = '/checkout/:product/renew/:purchase_id/:site';
		analyticsProps = { product, purchase_id: purchaseId, site: selectedSiteSlug };
	} else if ( selectedFeature && plan ) {
		analyticsPath = '/checkout/features/:feature/:site/:plan';
		analyticsProps = { feature: selectedFeature, plan, site: selectedSiteSlug };
	} else if ( selectedFeature && ! plan ) {
		analyticsPath = '/checkout/features/:feature/:site';
		analyticsProps = { feature: selectedFeature, site: selectedSiteSlug };
	} else if ( product && ! purchaseId ) {
		analyticsPath = '/checkout/:site/:product';
		analyticsProps = { product, site: selectedSiteSlug };
	} else if ( selectedSiteSlug ) {
		analyticsPath = '/checkout/:site';
		analyticsProps = { site: selectedSiteSlug };
	} else {
		analyticsPath = '/checkout/no-site';
	}
	return { analyticsPath, analyticsProps };
}

function displayRenewalSuccessNotice( responseCart, purchases, translate, moment ) {
	const renewalItem = getRenewalItems( responseCart )[ 0 ];
	// group all purchases into an array
	const purchasedProducts = Object.values( purchases ?? {} ).reduce(
		( result, value ) => result.concat( value ),
		[]
	);
	// and take the first product which matches the product id of the renewalItem
	const product = purchasedProducts.find( ( item ) => {
		return String( item.product_id ) === String( renewalItem.product_id );
	} );

	if ( ! product ) {
		debug( 'no product found for renewal notice matching', renewalItem, 'in', purchasedProducts );
		return;
	}

	if ( product.will_auto_renew ) {
		debug( 'showing notice for product that will auto-renew' );
		notices.success(
			translate(
				'%(productName)s has been renewed and will now auto renew in the future. ' +
					'{{a}}Learn more{{/a}}',
				{
					args: {
						productName: renewalItem.product_name,
					},
					components: {
						a: <a href={ AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />,
					},
				}
			),
			{ persistent: true }
		);
		return;
	}

	debug( 'showing notice for product that will not auto-renew' );
	notices.success(
		translate(
			'Success! You renewed %(productName)s for %(duration)s, until %(date)s. ' +
				'We sent your receipt to %(email)s.',
			{
				args: {
					productName: renewalItem.product_name,
					duration: moment.duration( { days: renewalItem.bill_period } ).humanize(),
					date: moment( product.expiry ).format( 'LL' ),
					email: product.user_email,
				},
			}
		),
		{ persistent: true }
	);
}
