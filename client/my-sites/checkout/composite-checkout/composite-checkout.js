/**
 * External dependencies
 */
import page from 'page';
import wp from 'lib/wp';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import debugFactory from 'debug';
import { useSelector, useDispatch, useStore } from 'react-redux';
import {
	WPCheckout,
	useWpcomStore,
	FormFieldAnnotation,
	areDomainsInLineItems,
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
} from 'my-sites/checkout/composite-checkout/wpcom';
import { CheckoutProvider, defaultRegistry } from '@automattic/composite-checkout';

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
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import {
	requestContactDetailsCache,
	updateContactDetailsCache,
} from 'state/domains/management/actions';
import RegistrantExtraInfoForm from 'components/domains/registrant-extra-info';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { StateSelect } from 'my-sites/domains/components/form';
import ManagedContactDetailsFormFields from 'components/domains/contact-details-form-fields/managed-contact-details-form-fields';
import { getPlan } from 'lib/plans';
import { getTopLevelOfTld } from 'lib/domains';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { useStripe } from 'lib/stripe';
import CheckoutTerms from '../checkout/checkout-terms.jsx';
import useShowStripeLoadingErrors from './use-show-stripe-loading-errors';
import useCreatePaymentMethods from './use-create-payment-methods';
import {
	applePayProcessor,
	freePurchaseProcessor,
	stripeCardProcessor,
	fullCreditsProcessor,
	existingCardProcessor,
	payPalProcessor,
	genericRedirectProcessor,
} from './payment-method-processors';
import { useGetThankYouUrl } from './use-get-thank-you-url';
import createAnalyticsEventHandler from './record-analytics';
import { fillInSingleCartItemAttributes } from 'lib/cart-values';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
	hasRenewalItem,
	getRenewalItems,
	hasPlan,
} from 'lib/cart-values/cart-items';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QueryStoredCards from 'components/data/query-stored-cards';
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
import { useWpcomProductVariants } from './wpcom/hooks/product-variants';
import { CartProvider } from './cart-provider';
import { translateResponseCartToWPCOMCart } from './wpcom/lib/translate-cart';
import useShoppingCartManager from './wpcom/hooks/use-shopping-cart-manager';
import useShowAddCouponSuccessMessage from './wpcom/hooks/use-show-add-coupon-success-message';
import useCountryList from './wpcom/hooks/use-country-list';

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
	infoMessage,
} ) {
	const translate = useTranslate();
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const isLoadingCartSynchronizer =
		cart && ( ! cart.hasLoadedFromServer || cart.hasPendingServerUpdates );
	const hideNudge = isComingFromUpsell;
	const reduxDispatch = useDispatch();
	const recordEvent = useCallback( createAnalyticsEventHandler( reduxDispatch ), [] );

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
		cartKey: siteId,
		canInitializeCart: canInitializeCart && ! isLoadingCartSynchronizer && ! isFetchingProducts,
		productsToAdd: productsForCart,
		couponToAdd: couponCodeFromUrl,
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
	useCachedDomainContactDetails();

	useDisplayErrors( [ ...errors, loadingError ].filter( Boolean ), showErrorMessage );

	const isFullCredits = credits?.amount.value > 0 && credits?.amount.value >= subtotal.amount.value;
	const itemsForCheckout = ( items.length
		? [ ...items, tax, couponItem, ...( isFullCredits ? [] : [ credits ] ) ]
		: []
	).filter( Boolean );
	debug( 'items for checkout', itemsForCheckout );

	useRedirectIfCartEmpty(
		items,
		`/plans/${ siteSlug || '' }`,
		isLoadingCart,
		[ ...errors, loadingError ].filter( Boolean )
	);

	const { storedCards, isLoading: isLoadingStoredCards } = useStoredCards(
		getStoredCards || wpcomGetStoredCards,
		recordEvent
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

	const renderDomainContactFields = (
		domainNames,
		contactDetails,
		contactDetailsErrors,
		updateDomainContactFields,
		shouldShowContactDetailsValidationErrors,
		isDisabled
	) => {
		const needsOnlyGoogleAppsDetails =
			hasGoogleApps( responseCart ) &&
			! hasDomainRegistration( responseCart ) &&
			! hasTransferProduct( responseCart );
		const getIsFieldDisabled = () => isDisabled;
		const tlds = getAllTopLevelTlds( domainNames );

		return (
			<React.Fragment>
				<ManagedContactDetailsFormFields
					needsOnlyGoogleAppsDetails={ needsOnlyGoogleAppsDetails }
					contactDetails={ contactDetails }
					contactDetailsErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					onContactDetailsChange={ updateDomainContactFields }
					getIsFieldDisabled={ getIsFieldDisabled }
				/>
				{ tlds.includes( 'ca' ) && (
					<RegistrantExtraInfoForm
						contactDetails={ contactDetails }
						ccTldDetails={ contactDetails?.extra?.ca ?? {} }
						onContactDetailsChange={ updateDomainContactFields }
						contactDetailsValidationErrors={
							shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
						}
						tld={ 'ca' }
						getDomainNames={ () => domainNames }
						translate={ translate }
						isManaged={ true }
					/>
				) }
				{ tlds.includes( 'uk' ) && (
					<RegistrantExtraInfoForm
						contactDetails={ contactDetails }
						ccTldDetails={ contactDetails?.extra?.uk ?? {} }
						onContactDetailsChange={ updateDomainContactFields }
						contactDetailsValidationErrors={
							shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
						}
						tld={ 'uk' }
						getDomainNames={ () => domainNames }
						translate={ translate }
						isManaged={ true }
					/>
				) }
				{ tlds.includes( 'fr' ) && (
					<RegistrantExtraInfoForm
						contactDetails={ contactDetails }
						ccTldDetails={ contactDetails?.extra?.fr ?? {} }
						onContactDetailsChange={ updateDomainContactFields }
						contactDetailsValidationErrors={
							shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
						}
						tld={ 'fr' }
						getDomainNames={ () => domainNames }
						translate={ translate }
						isManaged={ true }
					/>
				) }
			</React.Fragment>
		);
	};

	const getItemVariants = useWpcomProductVariants( {
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

	const paymentProcessors = useMemo(
		() => ( {
			'apple-pay': applePayProcessor,
			'free-purchase': freePurchaseProcessor,
			card: stripeCardProcessor,
			alipay: ( transactionData ) =>
				genericRedirectProcessor( 'alipay', transactionData, getThankYouUrl, siteSlug ),
			p24: ( transactionData ) =>
				genericRedirectProcessor( 'p24', transactionData, getThankYouUrl, siteSlug ),
			bancontact: ( transactionData ) =>
				genericRedirectProcessor( 'bancontact', transactionData, getThankYouUrl, siteSlug ),
			giropay: ( transactionData ) =>
				genericRedirectProcessor( 'giropay', transactionData, getThankYouUrl, siteSlug ),
			wechat: ( transactionData ) =>
				genericRedirectProcessor( 'wechat', transactionData, getThankYouUrl, siteSlug ),
			ideal: ( transactionData ) =>
				genericRedirectProcessor( 'ideal', transactionData, getThankYouUrl, siteSlug ),
			sofort: ( transactionData ) =>
				genericRedirectProcessor( 'sofort', transactionData, getThankYouUrl, siteSlug ),
			eps: ( transactionData ) =>
				genericRedirectProcessor( 'eps', transactionData, getThankYouUrl, siteSlug ),
			'full-credits': fullCreditsProcessor,
			'existing-card': existingCardProcessor,
			paypal: ( transactionData ) => payPalProcessor( transactionData, getThankYouUrl, couponItem ),
		} ),
		[ couponItem, getThankYouUrl, siteSlug ]
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

	return (
		<React.Fragment>
			<QuerySitePlans siteId={ siteId } />
			<QueryPlans />
			<QueryProducts />
			<QueryContactDetailsCache />
			<QueryStoredCards />

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
					isLoading={
						isLoadingCart || isLoadingStoredCards || paymentMethods.length < 1 || items.length < 1
					}
					isValidating={ isCartPendingUpdate }
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
						renderDomainContactFields={ renderDomainContactFields }
						variantSelectOverride={ variantSelectOverride }
						getItemVariants={ getItemVariants }
						responseCart={ responseCart }
						addItemToCart={ addItemWithEssentialProperties }
						subtotal={ subtotal }
						isCartPendingUpdate={ isCartPendingUpdate }
						CheckoutTerms={ CheckoutTerms }
						showErrorMessageBriefly={ showErrorMessageBriefly }
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

function useDisplayErrors( errors, displayError ) {
	useEffect( () => {
		errors.filter( isNotCouponError ).map( ( error ) => displayError( error.message ) );
	}, [ errors, displayError ] );
}

function isNotCouponError( error ) {
	const couponErrorCodes = [
		'coupon-not-found',
		'coupon-already-used',
		'coupon-no-longer-valid',
		'coupon-expired',
		'coupon-unknown-error',
	];
	return ! couponErrorCodes.includes( error.code );
}

function useRedirectIfCartEmpty( items, redirectUrl, isLoading, errors ) {
	useEffect( () => {
		if ( ! isLoading && items.length === 0 && errors.length === 0 ) {
			debug( 'cart is empty and not still loading; redirecting...' );
			page.redirect( redirectUrl );
			return;
		}
	}, [ redirectUrl, items, isLoading, errors ] );
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

function useCachedDomainContactDetails() {
	const reduxDispatch = useDispatch();
	const [ haveRequestedCachedDetails, setHaveRequestedCachedDetails ] = useState( false );

	useEffect( () => {
		// Dispatch exactly once
		if ( ! haveRequestedCachedDetails ) {
			debug( 'requesting cached domain contact details' );
			reduxDispatch( requestContactDetailsCache() );
			setHaveRequestedCachedDetails( true );
		}
	}, [ haveRequestedCachedDetails, reduxDispatch ] );

	const cachedContactDetails = useSelector( getContactDetailsCache );
	if ( cachedContactDetails ) {
		dispatch( 'wpcom' ).loadDomainContactDetailsFromCache( cachedContactDetails );
	}
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

function getAllTopLevelTlds( domainNames ) {
	return Array.from( new Set( domainNames.map( getTopLevelOfTld ) ) ).sort();
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
