/**
 * External dependencies
 */
import page from 'page';
import React, { useCallback, useMemo } from 'react';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import debugFactory from 'debug';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { CheckoutProvider, checkoutTheme, defaultRegistry } from '@automattic/composite-checkout';
import { useShoppingCart, ResponseCart } from '@automattic/shopping-cart';
import { colors } from '@automattic/color-studio';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import notices from 'calypso/notices';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { updateContactDetailsCache } from 'calypso/state/domains/management/actions';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { StateSelect } from 'calypso/my-sites/domains/components/form';
import { getPlan } from 'calypso/lib/plans';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useStripe } from 'calypso/lib/stripe';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { hasRenewalItem, getRenewalItems, hasPlan } from 'calypso/lib/cart-values/cart-items';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryProducts from 'calypso/components/data/query-products-list';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { fetchReceiptCompleted } from 'calypso/state/receipts/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSitesAndUser } from 'calypso/lib/signup/step-actions/fetch-sites-and-user';
import { getDomainNameFromReceiptOrCart } from 'calypso/lib/domains/cart-utils';
import { AUTO_RENEWAL } from 'calypso/lib/url/support';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { isGSuiteProductSlug } from 'calypso/lib/gsuite';
import {
	retrieveSignupDestination,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import CartMessages from 'calypso/my-sites/checkout/cart/cart-messages';
import {
	useStoredCards,
	useIsApplePayAvailable,
	filterAppropriatePaymentMethods,
} from './payment-method-helpers';
import usePrepareProductsForCart from './hooks/use-prepare-products-for-cart';
import CheckoutTerms from '../checkout/checkout-terms.jsx';
import useCreatePaymentMethods from './use-create-payment-methods';
import {
	applePayProcessor,
	freePurchaseProcessor,
	multiPartnerCardProcessor,
	fullCreditsProcessor,
	existingCardProcessor,
	payPalProcessor,
	genericRedirectProcessor,
	weChatProcessor,
} from './payment-method-processors';
import useGetThankYouUrl from './hooks/use-get-thank-you-url';
import createAnalyticsEventHandler from './record-analytics';
import { useProductVariants } from './hooks/product-variants';
import { translateResponseCartToWPCOMCart } from './lib/translate-cart';
import useShowAddCouponSuccessMessage from './hooks/use-show-add-coupon-success-message';
import useCountryList from './hooks/use-country-list';
import { needsDomainDetails } from './payment-method-helpers';
import useCachedDomainContactDetails from './hooks/use-cached-domain-contact-details';
import useActOnceOnStrings from './hooks/use-act-once-on-strings';
import useRedirectIfCartEmpty from './hooks/use-redirect-if-cart-empty';
import useRecordCheckoutLoaded from './hooks/use-record-checkout-loaded';
import useRecordCartLoaded from './hooks/use-record-cart-loaded';
import useAddProductsFromUrl from './hooks/use-add-products-from-url';
import useDetectedCountryCode from './hooks/use-detected-country-code';
import WPCheckout from './components/wp-checkout';
import { useWpcomStore } from './hooks/wpcom-store';
import { areDomainsInLineItems } from './hooks/has-domains';
import {
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
} from './types/wpcom-store-state';
import { StoredCard } from './types/stored-cards';
import { CheckoutPaymentMethodSlug } from './types/checkout-payment-method-slug';
import { CountryListItem } from './types/country-list-item';
import { TransactionResponse, Purchase } from './types/wpcom-store-state';
import { WPCOMCartItem } from './types/checkout-cart';
import doesValueExist from './lib/does-value-exist';

const debug = debugFactory( 'calypso:composite-checkout:composite-checkout' );

const { select, registerStore } = defaultRegistry;

const wpcom = wp.undocumented();

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcomGetStoredCards = (): StoredCard[] => wpcom.getStoredCards();

export default function CompositeCheckout( {
	siteSlug,
	siteId,
	productAliasFromUrl,
	getStoredCards,
	allowedPaymentMethods,
	onlyLoadPaymentMethods,
	overrideCountryList,
	redirectTo,
	feature,
	plan,
	purchaseId,
	couponCode: couponCodeFromUrl,
	isComingFromUpsell,
	isLoggedOutCart,
	isNoSiteCart,
	infoMessage,
	isInEditor,
}: {
	siteSlug: string | undefined;
	siteId: number | undefined;
	productAliasFromUrl?: string | undefined;
	getStoredCards?: () => StoredCard[];
	allowedPaymentMethods?: CheckoutPaymentMethodSlug[];
	onlyLoadPaymentMethods?: CheckoutPaymentMethodSlug[];
	overrideCountryList?: CountryListItem[];
	redirectTo?: string | undefined;
	feature?: string | undefined;
	plan?: string | undefined;
	purchaseId?: number | undefined;
	couponCode?: string | undefined;
	isComingFromUpsell?: boolean;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	isInEditor?: boolean;
	infoMessage?: JSX.Element;
} ): JSX.Element {
	const translate = useTranslate();
	const isJetpackNotAtomic =
		useSelector(
			( state ) => siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
		) || false;
	const isPrivate = useSelector( ( state ) => siteId && isPrivateSite( state, siteId ) ) || false;
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const hideNudge = !! isComingFromUpsell;
	const createUserAndSiteBeforeTransaction = Boolean( isLoggedOutCart || isNoSiteCart );
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

	const showAddCouponSuccessMessage = ( couponCode: string ): void => {
		showSuccessMessage(
			translate( "The '%(couponCode)s' coupon was successfully applied to your shopping cart.", {
				args: { couponCode },
			} )
		);
	};

	const countriesList = useCountryList( overrideCountryList || [] );

	const {
		productsForCart,
		renewalsForCart,
		isLoading: areCartProductsPreparing,
		error: cartProductPrepError,
	} = usePrepareProductsForCart( {
		productAliasFromUrl,
		purchaseId,
		isJetpackNotAtomic,
		isPrivate,
	} );

	const {
		removeProductFromCart,
		couponStatus,
		applyCoupon,
		removeCoupon,
		updateLocation,
		replaceProductInCart,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		responseCart,
		loadingError: cartLoadingError,
		loadingErrorType: cartLoadingErrorType,
		addProductsToCart,
		replaceProductsInCart,
	} = useShoppingCart();

	const isInitialCartLoading = useAddProductsFromUrl( {
		isLoadingCart,
		isCartPendingUpdate,
		productsForCart,
		renewalsForCart,
		areCartProductsPreparing,
		couponCodeFromUrl,
		applyCoupon,
		addProductsToCart,
		replaceProductsInCart,
	} );

	useRecordCartLoaded( {
		recordEvent,
		responseCart,
		productsForCart,
		isInitialCartLoading,
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

	const getThankYouUrlBase = useGetThankYouUrl( {
		siteSlug,
		redirectTo,
		purchaseId,
		feature,
		cart: responseCart,
		isJetpackNotAtomic,
		productAliasFromUrl,
		hideNudge,
		isInEditor,
	} );
	const getThankYouUrl = useCallback( () => {
		const url = getThankYouUrlBase();
		recordEvent( {
			type: 'THANK_YOU_URL_GENERATED',
			payload: { url },
		} );
		return url;
	}, [ getThankYouUrlBase, recordEvent ] );

	const moment = useLocalizedMoment();
	const isDomainOnly =
		useSelector( ( state ) => siteId && isDomainOnlySite( state, siteId ) ) || false;
	const reduxStore = useStore();

	const onPaymentComplete = useCallback(
		( { paymentMethodId } ) => {
			debug( 'payment completed successfully' );
			const url = getThankYouUrl();
			recordEvent( {
				type: 'PAYMENT_COMPLETE',
				payload: { url, couponItem, paymentMethodId, total, responseCart },
			} );

			const transactionResult: TransactionResponse = select( 'wpcom' ).getTransactionResult();
			const receiptId = transactionResult.receipt_id;
			debug( 'transactionResult was', transactionResult );

			reduxDispatch( clearPurchases() );

			// Removes the destination cookie only if redirecting to the signup destination.
			// (e.g. if the destination is an upsell nudge, it does not remove the cookie).
			const destinationFromCookie = retrieveSignupDestination();
			if ( url.includes( destinationFromCookie ) ) {
				debug( 'clearing redirect url cookie' );
				clearSignupDestinationCookie();
			}

			if ( hasRenewalItem( responseCart ) && transactionResult.purchases ) {
				debug( 'purchase had a renewal' );
				displayRenewalSuccessNotice( responseCart, transactionResult.purchases, translate, moment );
			}

			if ( receiptId && transactionResult.purchases ) {
				debug( 'fetching receipt' );
				reduxDispatch( fetchReceiptCompleted( receiptId, transactionResult ) );
			}

			if ( siteId ) {
				reduxDispatch( requestSite( siteId ) );
			}

			if (
				( responseCart.create_new_blog &&
					Object.keys( transactionResult.purchases ?? {} ).length > 0 &&
					Object.keys( transactionResult.failed_purchases ?? {} ).length === 0 ) ||
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
				try {
					window.localStorage.removeItem( 'shoppingCart' );
					window.localStorage.removeItem( 'siteParams' );
				} catch ( err ) {}

				// We use window.location instead of page.redirect() so that the cookies are detected on fresh page load.
				// Using page.redirect() will take to the log in page which we don't want.
				window.location.href = url;
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
		applyContactDetailsRequiredMask(
			emptyManagedContactDetails,
			areDomainsInLineItems( items ) ? domainRequiredContactDetails : taxRequiredContactDetails
		),
		updateContactDetailsCache
	);

	useDetectedCountryCode();
	useCachedDomainContactDetails( updateLocation );

	// Record errors adding products to the cart
	useActOnceOnStrings( [ cartProductPrepError ].filter( doesValueExist ), ( messages ) => {
		messages.forEach( ( message ) =>
			recordEvent( { type: 'PRODUCTS_ADD_ERROR', payload: message } )
		);
	} );

	useActOnceOnStrings( [ cartLoadingError ].filter( doesValueExist ), ( messages ) => {
		messages.forEach( ( message ) =>
			recordEvent( { type: 'CART_ERROR', payload: { type: cartLoadingErrorType, message } } )
		);
	} );

	// Display errors. Note that we display all errors if any of them change,
	// because notices.error() otherwise will remove the previously displayed
	// errors.
	const errorsToDisplay = [
		cartLoadingError,
		stripeLoadingError?.message,
		cartProductPrepError,
	].filter( doesValueExist );
	useActOnceOnStrings( errorsToDisplay, () => {
		notices.error( errorsToDisplay.map( ( message ) => <p key={ message }>{ message }</p> ) );
	} );

	const isFullCredits =
		credits?.amount && credits.amount.value > 0 && credits.amount.value >= subtotal.amount.value;
	const itemsForCheckout = ( items.length
		? [ ...items, tax, couponItem, ...( isFullCredits ? [] : [ credits ] ) ]
		: []
	).filter( doesValueExist );
	debug( 'items for checkout', itemsForCheckout );

	let cartEmptyRedirectUrl = `/plans/${ siteSlug || '' }`;

	if ( createUserAndSiteBeforeTransaction ) {
		const siteSlugLoggedOutCart = select( 'wpcom' )?.getSiteSlug();
		cartEmptyRedirectUrl = siteSlugLoggedOutCart ? `/plans/${ siteSlugLoggedOutCart }` : '/start';
	}

	const errors = responseCart.messages?.errors ?? [];
	const areThereErrors =
		[ ...errors, cartLoadingError, cartProductPrepError ].filter( doesValueExist ).length > 0;
	const doNotRedirect = isInitialCartLoading || isCartPendingUpdate || areThereErrors;
	useRedirectIfCartEmpty(
		doNotRedirect,
		items,
		cartEmptyRedirectUrl,
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
		isInitialCartLoading ||
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
		String( purchaseId ),
		productAliasFromUrl,
		siteSlug,
		feature,
		plan
	);

	const products = useSelector( ( state ) => getProductsList( state ) );

	const changePlanLength = useCallback(
		( uuidToReplace, newProductSlug, newProductId ) => {
			recordEvent( {
				type: 'CART_CHANGE_PLAN_LENGTH',
				payload: { newProductSlug },
			} );
			replaceProductInCart( uuidToReplace, {
				product_slug: newProductSlug,
				product_id: newProductId,
			} );
		},
		[ replaceProductInCart, recordEvent ]
	);

	// Often products are added using just the product_slug but missing the
	// product_id; this adds it.
	const addItemWithEssentialProperties = useCallback(
		( cartItem ) => {
			const adjustedItem = fillInSingleCartItemAttributes( cartItem, products );
			recordEvent( {
				type: 'CART_ADD_ITEM',
				payload: adjustedItem,
			} );
			addProductsToCart( [ adjustedItem ] );
		},
		[ addProductsToCart, products, recordEvent ]
	);

	const includeDomainDetails = needsDomainDetails( responseCart );
	const includeGSuiteDetails = items.some( ( item ) =>
		isGSuiteProductSlug( item.wpcom_meta?.product_slug )
	);
	const dataForProcessor = useMemo(
		() => ( {
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent,
		} ),
		[ includeDomainDetails, includeGSuiteDetails, recordEvent ]
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
			'apple-pay': ( transactionData: unknown ) =>
				applePayProcessor( transactionData, dataForProcessor, transactionOptions ),
			'free-purchase': ( transactionData: unknown ) =>
				freePurchaseProcessor( transactionData, dataForProcessor ),
			card: ( transactionData: unknown ) =>
				multiPartnerCardProcessor( transactionData, dataForProcessor, transactionOptions ),
			alipay: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'alipay', transactionData, dataForRedirectProcessor ),
			p24: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'p24', transactionData, dataForRedirectProcessor ),
			bancontact: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'bancontact', transactionData, dataForRedirectProcessor ),
			giropay: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'giropay', transactionData, dataForRedirectProcessor ),
			wechat: ( transactionData: unknown ) =>
				weChatProcessor( transactionData, dataForRedirectProcessor ),
			netbanking: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'netbanking', transactionData, dataForRedirectProcessor ),
			id_wallet: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'id_wallet', transactionData, dataForRedirectProcessor ),
			ideal: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'ideal', transactionData, dataForRedirectProcessor ),
			sofort: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'sofort', transactionData, dataForRedirectProcessor ),
			eps: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'eps', transactionData, dataForRedirectProcessor ),
			'ebanx-tef': ( transactionData: unknown ) =>
				genericRedirectProcessor( 'brazil-tef', transactionData, dataForRedirectProcessor ),
			'full-credits': ( transactionData: unknown ) =>
				fullCreditsProcessor( transactionData, dataForProcessor, transactionOptions ),
			'existing-card': ( transactionData: unknown ) =>
				existingCardProcessor( transactionData, dataForProcessor, transactionOptions ),
			paypal: ( transactionData: unknown ) =>
				payPalProcessor(
					transactionData,
					{ ...dataForProcessor, getThankYouUrl, couponItem },
					transactionOptions
				),
		} ),
		[ couponItem, dataForProcessor, dataForRedirectProcessor, getThankYouUrl, transactionOptions ]
	);

	useRecordCheckoutLoaded( {
		recordEvent,
		isLoadingCart: isInitialCartLoading,
		isApplePayAvailable,
		isApplePayLoading,
		isLoadingStoredCards,
		responseCart,
		storedCards,
		productAliasFromUrl,
	} );

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
		isInitialCartLoading || isLoadingStoredCards || paymentMethods.length < 1 || items.length < 1;
	if ( isLoading ) {
		debug( 'still loading because one of these is true', {
			isInitialCartLoading,
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
			<CartMessages
				cart={ responseCart }
				selectedSite={ { slug: siteSlug } }
				isLoadingCart={ isInitialCartLoading }
			/>
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
					removeProductFromCart={ removeProductFromCart }
					updateLocation={ updateLocation }
					applyCoupon={ applyCoupon }
					removeCoupon={ removeCoupon }
					couponStatus={ couponStatus }
					changePlanLength={ changePlanLength }
					siteId={ siteId }
					siteUrl={ siteSlug }
					countriesList={ countriesList }
					StateSelect={ StateSelect }
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
		</React.Fragment>
	);
}

CompositeCheckout.propTypes = {
	siteSlug: PropTypes.string,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	productAliasFromUrl: PropTypes.string,
	getCart: PropTypes.func,
	setCart: PropTypes.func,
	getStoredCards: PropTypes.func,
	allowedPaymentMethods: PropTypes.array,
	redirectTo: PropTypes.string,
	feature: PropTypes.string,
	plan: PropTypes.string,
	cart: PropTypes.object,
	transaction: PropTypes.object,
	isInEditor: PropTypes.bool,
};

function getPlanProductSlugs( items: WPCOMCartItem[] ): string[] {
	return items
		.filter( ( item ) => {
			return item.type !== 'tax' && getPlan( item.wpcom_meta.product_slug );
		} )
		.map( ( item ) => item.wpcom_meta.product_slug );
}

function getAnalyticsPath(
	purchaseId: string | undefined,
	product: string | undefined,
	selectedSiteSlug: string | undefined,
	selectedFeature: string | undefined,
	plan: string | undefined
): { analyticsPath: string; analyticsProps: Record< string, string > } {
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

function displayRenewalSuccessNotice(
	responseCart: ResponseCart,
	purchases: Record< number, Purchase >,
	translate: ReturnType< typeof useTranslate >,
	moment: ReturnType< typeof useLocalizedMoment >
): void {
	const renewalItem = getRenewalItems( responseCart )[ 0 ];
	// group all purchases into an array
	const purchasedProducts = Object.values( purchases ?? {} ).reduce(
		( result: Purchase[], value: Purchase ) => [ ...result, value ],
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
