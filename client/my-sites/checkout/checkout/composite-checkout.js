/**
 * External dependencies
 */
import page from 'page';
import wp from 'lib/wp';
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import debugFactory from 'debug';
import { useSelector, useDispatch } from 'react-redux';
import {
	WPCheckout,
	WPCheckoutErrorBoundary,
	useWpcomStore,
	useShoppingCart,
	FormFieldAnnotation,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	areDomainsInLineItems,
	domainManagedContactDetails,
	taxManagedContactDetails,
	areRequiredFieldsNotEmpty,
} from '@automattic/composite-checkout-wpcom';
import {
	CheckoutProvider,
	createFreePaymentMethod,
	createApplePayMethod,
	createExistingCardMethod,
	defaultRegistry,
} from '@automattic/composite-checkout';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import {
	conciergeSessionItem,
	domainMapping,
	planItem,
	themeItem,
	jetpackProductItem,
} from 'lib/cart-values/cart-items';
import { requestPlans } from 'state/plans/actions';
import { getPlanBySlug, getPlans, isRequestingPlans } from 'state/plans/selectors';
import {
	computeProductsWithPrices,
	getProductBySlug,
	getProductsList,
	isProductsListFetching,
} from 'state/products-list/selectors';
import {
	useStoredCards,
	getDomainDetails,
	isPaymentMethodEnabled,
	wpcomTransaction,
	submitFreePurchaseTransaction,
	WordPressFreePurchaseLabel,
	WordPressFreePurchaseSummary,
	submitApplePayPayment,
	submitExistingCardPayment,
	useIsApplePayAvailable,
} from './composite-checkout-payment-methods';
import notices from 'notices';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import {
	requestContactDetailsCache,
	updateContactDetailsCache,
} from 'state/domains/management/actions';
import { FormCountrySelect } from 'components/forms/form-country-select';
import getCountries from 'state/selectors/get-countries';
import { fetchPaymentCountries } from 'state/countries/actions';
import { StateSelect } from 'my-sites/domains/components/form';
import ContactDetailsFormFields from 'components/domains/contact-details-form-fields';
import { getSelectedSite } from 'state/ui/selectors';
import isEligibleForSignupDestination from 'state/selectors/is-eligible-for-signup-destination';
import getPreviousPath from 'state/selectors/get-previous-path.js';
import { getPlan, findPlansKeys } from 'lib/plans';
import { GROUP_WPCOM, TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { requestProductsList } from 'state/products-list/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import analytics from 'lib/analytics';
import { useStripe } from 'lib/stripe';
import CheckoutTerms from './checkout-terms.jsx';
import useShowStripeLoadingErrors from './composite-checkout/use-show-stripe-loading-errors';
import {
	useCreatePayPal,
	useCreateStripe,
	useCreateFullCredits,
} from './composite-checkout/use-create-payment-methods';
import { useGetThankYouUrl } from './composite-checkout/use-get-thank-you-url';

const debug = debugFactory( 'calypso:composite-checkout' );

const { select, dispatch, registerStore } = defaultRegistry;

const wpcom = wp.undocumented();

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcomGetCart = ( ...args ) => wpcom.getCart( ...args );
const wpcomSetCart = ( ...args ) => wpcom.setCart( ...args );
const wpcomGetStoredCards = ( ...args ) => wpcom.getStoredCards( ...args );
const wpcomValidateDomainContactInformation = ( ...args ) =>
	wpcom.validateDomainContactInformation( ...args );

export default function CompositeCheckout( {
	siteSlug,
	siteId,
	product,
	getCart,
	setCart,
	getStoredCards,
	validateDomainContactDetails,
	allowedPaymentMethods,
	onlyLoadPaymentMethods,
	overrideCountryList,
	redirectTo,
	feature,
	plan,
	purchaseId,
	cart,
	couponCode: couponCodeFromUrl,
} ) {
	const translate = useTranslate();
	const isJetpackNotAtomic = useSelector(
		state => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const selectedSiteData = useSelector( state => getSelectedSite( state ) );
	const adminUrl = selectedSiteData?.options?.admin_url;
	const isEligibleForSignupDestinationResult = useSelector( state =>
		isEligibleForSignupDestination( state, siteId, cart )
	);
	const previousRoute = useSelector( state => getPreviousPath( state ) );
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const isLoadingCartSynchronizer =
		cart && ( ! cart.hasLoadedFromServer || cart.hasPendingServerUpdates );

	const getThankYouUrl = useGetThankYouUrl( {
		select,
		siteSlug,
		adminUrl,
		redirectTo,
		purchaseId,
		feature,
		cart,
		isJetpackNotAtomic,
		product,
		previousRoute,
		isEligibleForSignupDestination: isEligibleForSignupDestinationResult,
	} );
	const reduxDispatch = useDispatch();
	const recordEvent = useCallback( getCheckoutEventHandler( reduxDispatch ), [] );

	useEffect( () => {
		debug( 'composite checkout has loaded' );
		recordEvent( { type: 'CHECKOUT_LOADED' } );
	}, [ recordEvent ] );

	const showErrorMessage = useCallback(
		error => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ) );
		},
		[ translate ]
	);

	const showInfoMessage = useCallback( message => {
		debug( 'info', message );
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( message => {
		debug( 'success', message );
		notices.success( message );
	}, [] );

	const showAddCouponSuccessMessage = couponCode => {
		showSuccessMessage(
			translate( "The '%(couponCode)s' coupon was successfully applied to your shopping cart.", {
				args: { couponCode },
			} )
		);
	};

	useShowStripeLoadingErrors( showErrorMessage, stripeLoadingError );

	const countriesList = useCountryList( overrideCountryList || [] );

	const { productForCart, canInitializeCart } = usePrepareProductForCart(
		siteId,
		product,
		isJetpackNotAtomic
	);

	const {
		items,
		tax,
		couponItem,
		total,
		credits,
		removeItem,
		submitCoupon,
		removeCoupon,
		updateLocation,
		couponStatus,
		changeItemVariant,
		errors,
		subtotal,
		isLoading: isLoadingCart,
		allowedPaymentMethods: serverAllowedPaymentMethods,
		variantRequestStatus,
		variantSelectOverride,
		responseCart,
	} = useShoppingCart(
		siteSlug,
		canInitializeCart && ! isLoadingCartSynchronizer,
		productForCart,
		couponCodeFromUrl,
		setCart || wpcomSetCart,
		getCart || wpcomGetCart,
		translate,
		showAddCouponSuccessMessage,
		recordEvent
	);

	const onPaymentComplete = useCallback(
		( { paymentMethodId } ) => {
			debug( 'payment completed successfully' );
			const url = getThankYouUrl();
			recordEvent( {
				type: 'PAYMENT_COMPLETE',
				payload: { url, couponItem, paymentMethodId, total, responseCart },
			} );
			page.redirect( url );
		},
		[ recordEvent, getThankYouUrl, total, couponItem, responseCart ]
	);

	useWpcomStore(
		registerStore,
		recordEvent,
		areDomainsInLineItems( items ) ? domainManagedContactDetails : taxManagedContactDetails,
		updateContactDetailsCache
	);

	useCachedDomainContactDetails();

	useDisplayErrors( errors, showErrorMessage );

	const itemsForCheckout = ( items.length ? [ ...items, tax, couponItem ] : [] ).filter( Boolean );
	debug( 'items for checkout', itemsForCheckout );

	useRedirectIfCartEmpty( items, `/plans/${ siteSlug || '' }`, isLoadingCart );

	const { storedCards, isLoading: isLoadingStoredCards } = useStoredCards(
		getStoredCards || wpcomGetStoredCards
	);

	const paypalMethod = useCreatePayPal( {
		onlyLoadPaymentMethods,
		getThankYouUrl,
		getItems: () => items,
	} );

	const stripeMethod = useCreateStripe( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const fullCreditsPaymentMethod = useCreateFullCredits( {
		onlyLoadPaymentMethods,
		credits,
	} );

	const shouldLoadFreePaymentMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'free-purchase' )
		: true;
	const freePaymentMethod = useMemo( () => {
		if ( ! shouldLoadFreePaymentMethod ) {
			return null;
		}
		return createFreePaymentMethod( {
			registerStore,
			submitTransaction: submitData => {
				const pending = submitFreePurchaseTransaction(
					{
						...submitData,
						siteId: select( 'wpcom' )?.getSiteId?.(),
						domainDetails: getDomainDetails( select ),
						// this data is intentionally empty so we do not charge taxes
						country: null,
						postalCode: null,
					},
					wpcomTransaction
				);
				// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
				pending.then( result => {
					debug( 'saving transaction response', result );
					dispatch( 'wpcom' ).setTransactionResponse( result );
				} );
				return pending;
			},
		} );
	}, [ shouldLoadFreePaymentMethod ] );
	if ( freePaymentMethod ) {
		freePaymentMethod.label = <WordPressFreePurchaseLabel />;
		freePaymentMethod.inactiveContent = <WordPressFreePurchaseSummary />;
	}

	const {
		canMakePayment: isApplePayAvailable,
		isLoading: isApplePayLoading,
	} = useIsApplePayAvailable( stripe, stripeConfiguration, !! stripeLoadingError, items );
	const shouldLoadApplePay = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'apple-pay' ) && isApplePayAvailable
		: isApplePayAvailable;
	const applePayMethod = useMemo( () => {
		if (
			! shouldLoadApplePay ||
			isStripeLoading ||
			stripeLoadingError ||
			! stripe ||
			! stripeConfiguration ||
			isApplePayLoading ||
			! isApplePayAvailable
		) {
			return null;
		}
		return createApplePayMethod( {
			getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			registerStore,
			submitTransaction: submitData => {
				const pending = submitApplePayPayment(
					{
						...submitData,
						siteId: select( 'wpcom' )?.getSiteId?.(),
						domainDetails: getDomainDetails( select ),
					},
					wpcomTransaction
				);
				// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
				pending.then( result => {
					debug( 'saving transaction response', result );
					dispatch( 'wpcom' ).setTransactionResponse( result );
				} );
				return pending;
			},
			stripe,
			stripeConfiguration,
		} );
	}, [
		shouldLoadApplePay,
		isApplePayLoading,
		stripe,
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
		isApplePayAvailable,
	] );

	const shouldLoadExistingCardsMethods = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'existingCard' )
		: true;
	const existingCardMethods = useMemo( () => {
		if ( ! shouldLoadExistingCardsMethods ) {
			return [];
		}
		return storedCards.map( storedDetails =>
			createExistingCardMethod( {
				id: `existingCard-${ storedDetails.stored_details_id }`,
				cardholderName: storedDetails.name,
				cardExpiry: storedDetails.expiry,
				brand: storedDetails.card_type,
				last4: storedDetails.card,
				stripeConfiguration,
				submitTransaction: submitData => {
					const pending = submitExistingCardPayment(
						{
							...submitData,
							siteId: select( 'wpcom' )?.getSiteId?.(),
							storedDetailsId: storedDetails.stored_details_id,
							paymentMethodToken: storedDetails.mp_ref,
							paymentPartnerProcessorId: storedDetails.payment_partner,
							domainDetails: getDomainDetails( select ),
						},
						wpcomTransaction
					);
					// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
					pending.then( result => {
						debug( 'saving transaction response', result );
						dispatch( 'wpcom' ).setTransactionResponse( result );
					} );
					return pending;
				},
				registerStore,
				getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			} )
		);
	}, [ stripeConfiguration, storedCards, shouldLoadExistingCardsMethods ] );

	const isPurchaseFree = ! isLoadingCart && total.amount.value === 0;
	debug( 'is purchase free?', isPurchaseFree );

	const paymentMethods =
		isLoadingCart ||
		isLoadingStoredCards ||
		( onlyLoadPaymentMethods
			? onlyLoadPaymentMethods.includes( 'apple-pay' ) && isApplePayLoading
			: isApplePayLoading ) ||
		items.length < 1
			? []
			: [
					freePaymentMethod,
					fullCreditsPaymentMethod,
					applePayMethod,
					...existingCardMethods,
					stripeMethod,
					paypalMethod,
			  ]
					.filter( methodObject => Boolean( methodObject ) )
					.filter( methodObject => {
						// If the purchase is free, only display the free-purchase method
						if ( methodObject.id === 'free-purchase' ) {
							return isPurchaseFree ? true : false;
						}
						return isPurchaseFree ? false : true;
					} )
					.filter( methodObject => {
						if ( methodObject.id === 'full-credits' ) {
							return credits.amount.value > 0 && credits.amount.value >= subtotal.amount.value;
						}
						if ( methodObject.id.startsWith( 'existingCard-' ) ) {
							return isPaymentMethodEnabled(
								'card',
								allowedPaymentMethods || serverAllowedPaymentMethods
							);
						}
						if ( methodObject.id === 'free-purchase' ) {
							// If the free payment method still exists here (see above filter), it's enabled
							return true;
						}
						return isPaymentMethodEnabled(
							methodObject.id,
							allowedPaymentMethods || serverAllowedPaymentMethods
						);
					} );

	const validateDomainContact =
		validateDomainContactDetails || wpcomValidateDomainContactInformation;

	const domainContactValidationCallback = (
		paymentMethodId,
		contactDetails,
		domainNames,
		applyDomainContactValidationResults,
		decoratedContactDetails
	) => {
		return new Promise( resolve => {
			validateDomainContact( contactDetails, domainNames, ( httpErrors, data ) => {
				recordEvent( {
					type: 'VALIDATE_DOMAIN_CONTACT_INFO',
					payload: {
						credits: null,
						payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ),
					},
				} );
				debug(
					'Domain contact info validation for domains',
					domainNames,
					'and contact info',
					contactDetails,
					'result:',
					data
				);
				if ( ! data ) {
					showErrorMessage(
						translate(
							'There was an error validating your contact information. Please contact support.'
						)
					);
					resolve( false );
					return;
				}
				if ( data.messages ) {
					showErrorMessage(
						translate(
							'We could not validate your contact information. Please review and update all the highlighted fields.'
						)
					);
				}
				applyDomainContactValidationResults( { ...data.messages } );
				resolve( ! ( data.success && areRequiredFieldsNotEmpty( decoratedContactDetails ) ) );
			} );
		} );
	};

	const renderDomainContactFields = (
		contactDetails,
		contactDetailsErrors,
		updateContactDetails,
		shouldShowContactDetailsValidationErrors,
		isDisabled
	) => {
		const getIsFieldDisabled = () => isDisabled;
		return (
			<WPCheckoutErrorBoundary>
				<ContactDetailsFormFields
					countriesList={ countriesList }
					contactDetails={ contactDetails }
					contactDetailsErrors={
						shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
					}
					onContactDetailsChange={ updateContactDetails }
					shouldForceRenderOnPropChange={ true }
					getIsFieldDisabled={ getIsFieldDisabled }
				/>
			</WPCheckoutErrorBoundary>
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

	return (
		<React.Fragment>
			<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />
			<CheckoutProvider
				locale={ 'en-us' }
				items={ itemsForCheckout }
				total={ total }
				onPaymentComplete={ onPaymentComplete }
				showErrorMessage={ showErrorMessage }
				showInfoMessage={ showInfoMessage }
				showSuccessMessage={ showSuccessMessage }
				onEvent={ recordEvent }
				paymentMethods={ paymentMethods }
				registry={ defaultRegistry }
				isLoading={
					isLoadingCart || isLoadingStoredCards || paymentMethods.length < 1 || items.length < 1
				}
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
					CountrySelectMenu={ CountrySelectMenu }
					countriesList={ countriesList }
					StateSelect={ StateSelect }
					renderDomainContactFields={ renderDomainContactFields }
					variantRequestStatus={ variantRequestStatus }
					variantSelectOverride={ variantSelectOverride }
					getItemVariants={ getItemVariants }
					domainContactValidationCallback={ domainContactValidationCallback }
					responseCart={ responseCart }
					CheckoutTerms={ CheckoutTerms }
				/>
			</CheckoutProvider>
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
		errors.filter( isNotCouponError ).map( error => displayError( error.message ) );
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

/**
 * Create and return an object to be added to the cart
 *
 * @returns ResponseCartProduct | null
 */
function createItemToAddToCart( {
	planSlug = null,
	productAlias = '',
	product_id = null,
	isJetpackNotAtomic = false,
} ) {
	let cartItem, cartMeta;

	if ( planSlug && product_id ) {
		debug( 'creating plan product' );
		cartItem = planItem( planSlug );
		cartItem.product_id = product_id;
	}

	if ( productAlias.startsWith( 'theme:' ) ) {
		debug( 'creating theme product' );
		cartMeta = productAlias.split( ':' )[ 1 ];
		cartItem = themeItem( cartMeta );
	}

	if ( productAlias.startsWith( 'domain-mapping:' ) && product_id ) {
		debug( 'creating domain mapping product' );
		cartMeta = productAlias.split( ':' )[ 1 ];
		cartItem = domainMapping( { domain: cartMeta } );
		cartItem.product_id = product_id;
	}

	if ( productAlias.startsWith( 'concierge-session' ) ) {
		// TODO: prevent adding a conciergeSessionItem if one already exists
		debug( 'creating concierge product' );
		cartItem = conciergeSessionItem();
	}

	if (
		( productAlias.startsWith( 'jetpack_backup' ) ||
			productAlias.startsWith( 'jetpack_search' ) ) &&
		isJetpackNotAtomic
	) {
		debug( 'creating jetpack product' );
		cartItem = jetpackProductItem( productAlias );
	}

	if ( ! cartItem ) {
		debug( 'no product created' );
		return null;
	}

	cartItem.extra = { ...cartItem.extra, context: 'calypstore' };

	cartItem.uuid = 'unknown'; // This must be filled-in later

	return cartItem;
}

function getCheckoutEventHandler( reduxDispatch ) {
	return function recordEvent( action ) {
		debug( 'heard checkout event', action );
		switch ( action.type ) {
			case 'CHECKOUT_LOADED':
				return reduxDispatch( recordTracksEvent( 'calypso_checkout_composite_loaded', {} ) );

			case 'PAYMENT_COMPLETE': {
				const total_cost = action.payload.total.amount.value / 100; // TODO: This conversion only works for USD! We have to localize this or get it from the server directly (or better yet, just force people to use the integer version).

				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_success', {
						coupon_code: action.payload.couponItem?.wpcom_meta.couponCode ?? '',
						currency: action.payload.total.amount.currency,
						payment_method:
							translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
								?.name || '',
						total_cost,
					} )
				);

				const transactionResult = select( 'wpcom' ).getTransactionResult();
				analytics.recordPurchase( {
					cart: {
						total_cost,
						currency: action.payload.total.amount.currency,
						is_signup: action.payload.responseCart.is_signup,
						products: action.payload.responseCart.products,
						coupon_code: action.payload.couponItem?.wpcom_meta.couponCode ?? '',
						total_tax: action.payload.responseCart.total_tax,
					},
					orderId: transactionResult.receipt_id,
				} );

				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_complete', {
						redirect_url: action.payload.url,
						coupon_code: action.payload.couponItem?.wpcom_meta.couponCode ?? '',
						total: action.payload.total.amount.value,
						currency: action.payload.total.amount.currency,
						payment_method:
							translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
								?.name || '',
					} )
				);
			}

			case 'CART_INIT_COMPLETE':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_cart_loaded', {
						products: action.payload.products.map( product => product.product_slug ).join( ',' ),
					} )
				);

			case 'CART_ERROR':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_cart_error', {
						error_type: action.payload.type,
						error_message: String( action.payload.message ),
					} )
				);

			case 'a8c_checkout_error':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_error', {
						error_type: action.payload.type,
						error_field: action.payload.field,
						error_message: action.payload.message,
					} )
				);

			case 'a8c_checkout_add_coupon':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_coupon_add_submit', {
						coupon: action.payload.coupon,
					} )
				);

			case 'a8c_checkout_cancel_delete_product':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_cancel_delete_product' )
				);

			case 'a8c_checkout_delete_product':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_delete_product', {
						product_name: action.payload.product_name,
					} )
				);

			case 'a8c_checkout_delete_product_press':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_delete_product_press', {
						product_name: action.payload.product_name,
					} )
				);

			case 'a8c_checkout_add_coupon_error':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_coupon_add_error', {
						error_type: action.payload.type,
					} )
				);

			case 'a8c_checkout_add_coupon_button_clicked':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_add_coupon_clicked', {} )
				);

			case 'STEP_NUMBER_CHANGED':
				if ( action.payload.stepNumber === 2 && action.payload.previousStepNumber === 1 ) {
					reduxDispatch(
						recordTracksEvent( 'calypso_checkout_composite_first_step_complete', {
							payment_method:
								translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
									?.name || '',
						} )
					);
				}
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_step_changed', {
						step: action.payload.stepNumber,
					} )
				);

			case 'STRIPE_TRANSACTION_BEGIN': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_stripe_submit_clicked', {} )
				);
			}

			case 'STRIPE_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_stripe_transaction_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'FREE_TRANSACTION_BEGIN': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_free_purchase_submit_clicked', {} )
				);
			}

			case 'FREE_PURCHASE_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_WPCOM',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_free_purchase_transaction_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'PAYPAL_TRANSACTION_BEGIN': {
				reduxDispatch( recordTracksEvent( 'calypso_checkout_form_redirect', {} ) );
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_paypal_submit_clicked', {} )
				);
			}

			case 'PAYPAL_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_paypal_transaction_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'FULL_CREDITS_TRANSACTION_BEGIN': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_full_credits_submit_clicked', {} )
				);
			}

			case 'FULL_CREDITS_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_WPCOM',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_full_credits_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'EXISTING_CARD_TRANSACTION_BEGIN': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_MoneyPress_Stored',
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_MoneyPress_Stored',
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_existing_card_submit_clicked', {} )
				);
			}

			case 'EXISTING_CARD_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_MoneyPress_Stored',
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_existing_card_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'APPLE_PAY_TRANSACTION_BEGIN': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Web_Payment',
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Web_Payment',
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_apple_pay_submit_clicked', {} )
				);
			}

			case 'APPLE_PAY_LOADING_ERROR':
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_apple_pay_error', {
						error_message: String( action.payload ),
						is_loading_error: true,
					} )
				);

			case 'APPLE_PAY_TRANSACTION_ERROR': {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_apple_pay_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'VALIDATE_DOMAIN_CONTACT_INFO': {
				// TODO: Decide what to do here
				return;
			}

			case 'SHOW_MODAL_AUTHORIZATION': {
				return reduxDispatch( recordTracksEvent( 'calypso_checkout_modal_authorization', {} ) );
			}

			default:
				debug( 'unknown checkout event', action );
				return reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_unknown_event', {
						error_type: String( action.type ),
					} )
				);
		}
	};
}

function useRedirectIfCartEmpty( items, redirectUrl, isLoading ) {
	const [ prevItemsLength, setPrevItemsLength ] = useState( 0 );

	useEffect( () => {
		setPrevItemsLength( items.length );
	}, [ items ] );

	useEffect( () => {
		if ( prevItemsLength > 0 && items.length === 0 ) {
			debug( 'cart has become empty; redirecting...' );
			page.redirect( redirectUrl );
			return;
		}
		if ( ! isLoading && items.length === 0 ) {
			debug( 'cart is empty and not still loading; redirecting...' );
			page.redirect( redirectUrl );
			return;
		}
	}, [ redirectUrl, items, prevItemsLength, isLoading ] );
}

function useCountryList( overrideCountryList ) {
	// Should we fetch the country list from global state?
	const shouldFetchList = overrideCountryList?.length <= 0;

	const [ countriesList, setCountriesList ] = useState( overrideCountryList );

	const reduxDispatch = useDispatch();
	const globalCountryList = useSelector( state => getCountries( state, 'payments' ) );

	// Has the global list been populated?
	const isListFetched = globalCountryList?.length > 0;

	useEffect( () => {
		if ( shouldFetchList ) {
			if ( isListFetched ) {
				setCountriesList( globalCountryList );
			} else {
				debug( 'countries list is empty; dispatching request for data' );
				reduxDispatch( fetchPaymentCountries() );
			}
		}
	}, [ shouldFetchList, isListFetched, globalCountryList, reduxDispatch ] );

	return countriesList;
}

function CountrySelectMenu( {
	translate,
	onChange,
	isDisabled,
	isError,
	errorMessage,
	currentValue,
	countriesList,
} ) {
	const countrySelectorId = 'country-selector';
	const countrySelectorLabelId = 'country-selector-label';
	const countrySelectorDescriptionId = 'country-selector-description';

	return (
		<FormFieldAnnotation
			labelText={ translate( 'Country' ) }
			isError={ isError }
			isDisabled={ isDisabled }
			formFieldId={ countrySelectorId }
			labelId={ countrySelectorLabelId }
			descriptionId={ countrySelectorDescriptionId }
			errorDescription={ errorMessage }
		>
			<FormCountrySelect
				id={ countrySelectorId }
				countriesList={ [
					{ code: '', name: translate( 'Select Country' ) },
					{ code: null, name: '' },
					...countriesList,
				] }
				translate={ translate }
				onChange={ onChange }
				disabled={ isDisabled }
				value={ currentValue }
				aria-labelledby={ countrySelectorLabelId }
				aria-describedby={ countrySelectorDescriptionId }
			/>
		</FormFieldAnnotation>
	);
}

function getTermText( term, translate ) {
	switch ( term ) {
		case TERM_BIENNIALLY:
			return translate( 'Two years' );

		case TERM_ANNUALLY:
			return translate( 'One year' );

		case TERM_MONTHLY:
			return translate( 'One month' );
	}
}

// TODO: replace this with a real localize function
function localizeCurrency( amount ) {
	const decimalAmount = ( amount / 100 ).toFixed( 2 );
	return `$${ decimalAmount }`;
}

function useWpcomProductVariants( { siteId, productSlug, credits, couponDiscounts } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const availableVariants = useVariantWpcomPlanProductSlugs( productSlug );

	const productsWithPrices = useSelector( state => {
		return computeProductsWithPrices(
			state,
			siteId,
			availableVariants, // : WPCOMProductSlug[]
			credits || 0, // : number
			couponDiscounts || {} // object of product ID / absolute amount pairs
		);
	} );

	const [ haveFetchedProducts, setHaveFetchedProducts ] = useState( false );
	const shouldFetchProducts = ! productsWithPrices;

	useEffect( () => {
		// Trigger at most one HTTP request
		debug( 'deciding whether to request product variant data' );
		if ( shouldFetchProducts && ! haveFetchedProducts ) {
			debug( 'dispatching request for product variant data' );
			reduxDispatch( requestPlans() );
			reduxDispatch( requestProductsList() );
			setHaveFetchedProducts( true );
		}
	}, [ shouldFetchProducts, haveFetchedProducts, reduxDispatch ] );

	return anyProductSlug => {
		if ( anyProductSlug !== productSlug ) {
			return [];
		}

		const highestMonthlyPrice = Math.max(
			...productsWithPrices.map( variant => {
				return variant.priceMonthly;
			} )
		);

		const percentSavings = monthlyPrice => {
			const savings = Math.round( 100 * ( 1 - monthlyPrice / highestMonthlyPrice ) );
			return savings > 0 ? <Discount>-{ savings.toString() }%</Discount> : null;
		};

		// What the customer would pay if using the
		// most expensive schedule
		const highestTermPrice = term => {
			if ( term !== TERM_BIENNIALLY ) {
				return;
			}
			const annualPrice = Math.round( 100 * 24 * highestMonthlyPrice );
			return <DoNotPayThis>{ localizeCurrency( annualPrice, 'USD' ) }</DoNotPayThis>;
		};

		return productsWithPrices.map( variant => {
			const label = getTermText( variant.plan.term, translate );
			const price = (
				<React.Fragment>
					{ percentSavings( variant.priceMonthly ) }
					{ highestTermPrice( variant.plan.term ) }
					{ variant.product.cost_display }
				</React.Fragment>
			);

			return {
				variantLabel: label,
				variantDetails: price,
				productSlug: variant.planSlug,
				productId: variant.product.product_id,
			};
		} );
	};
}

function useVariantWpcomPlanProductSlugs( productSlug ) {
	const reduxDispatch = useDispatch();

	const chosenPlan = getPlan( productSlug );

	const [ haveFetchedPlans, setHaveFetchedPlans ] = useState( false );
	const shouldFetchPlans = ! chosenPlan;

	useEffect( () => {
		// Trigger at most one HTTP request
		debug( 'deciding whether to request plan variant data' );
		if ( shouldFetchPlans && ! haveFetchedPlans ) {
			debug( 'dispatching request for plan variant data' );
			reduxDispatch( requestPlans() );
			reduxDispatch( requestProductsList() );
			setHaveFetchedPlans( true );
		}
	}, [ haveFetchedPlans, shouldFetchPlans, reduxDispatch ] );

	if ( ! chosenPlan ) {
		return [];
	}

	// Only construct variants for WP.com plans
	if ( chosenPlan.group !== GROUP_WPCOM ) {
		return [];
	}

	// : WPCOMProductSlug[]
	return findPlansKeys( {
		group: chosenPlan.group,
		type: chosenPlan.type,
	} );
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
		.filter( item => {
			return item.type !== 'tax' && getPlan( item.wpcom_meta.product_slug );
		} )
		.map( item => item.wpcom_meta.product_slug );
}

const Discount = styled.span`
	color: ${props => props.theme.colors.discount};
	margin-right: 8px;
`;

const DoNotPayThis = styled.span`
	text-decoration: line-through;
	margin-right: 8px;
`;

function getProductSlugFromAlias( productAlias ) {
	if ( productAlias?.startsWith?.( 'domain-mapping:' ) ) {
		return 'domain_map';
	}
	return null;
}

function usePrepareProductForCart( siteId, productAlias, isJetpackNotAtomic ) {
	const planSlug = useSelector( state =>
		getUpgradePlanSlugFromPath( state, siteId, productAlias )
	);
	const plans = useSelector( state => getPlans( state ) );
	const plan = useSelector( state => getPlanBySlug( state, planSlug ) );
	const products = useSelector( state => getProductsList( state ) );
	const product = useSelector( state =>
		getProductBySlug( state, getProductSlugFromAlias( productAlias ) )
	);
	const isFetchingProducts = useSelector( state => isProductsListFetching( state ) );
	const isFetchingPlans = useSelector( state => isRequestingPlans( state ) );
	const reduxDispatch = useDispatch();
	const [ { canInitializeCart, productForCart }, setState ] = useState( {
		canInitializeCart: ! planSlug && ! productAlias,
		productForCart: null,
	} );

	useEffect( () => {
		if ( ! isFetchingProducts && Object.keys( products || {} ).length < 1 ) {
			debug( 'fetching products list' );
			reduxDispatch( requestProductsList() );
			return;
		}
	}, [ isFetchingProducts, products, reduxDispatch ] );

	useEffect( () => {
		if ( ! isFetchingPlans && plans?.length < 1 ) {
			debug( 'fetching plans list' );
			reduxDispatch( requestPlans() );
			return;
		}
	}, [ isFetchingPlans, plans, reduxDispatch ] );

	// Add a plan if one is requested
	useEffect( () => {
		if ( ! planSlug || isFetchingPlans ) {
			return;
		}
		if ( isFetchingPlans ) {
			debug( 'waiting on plans fetch' );
			return;
		}
		if ( ! plan ) {
			debug( 'there is a request to add a plan but no plan was found', planSlug );
			setState( { canInitializeCart: true } );
			return;
		}
		const cartProduct = createItemToAddToCart( {
			planSlug,
			product_id: plan.product_id,
			isJetpackNotAtomic,
		} );
		debug(
			'preparing plan that was requested in url',
			{ planSlug, plan, isJetpackNotAtomic },
			cartProduct
		);
		setState( { productForCart: cartProduct, canInitializeCart: true } );
	}, [ isFetchingPlans, reduxDispatch, planSlug, plan, plans, isJetpackNotAtomic ] );

	// Add a supported product if one is requested
	useEffect( () => {
		if ( ! productAlias ) {
			return;
		}
		if ( planSlug ) {
			return;
		}
		if ( isFetchingPlans || isFetchingProducts ) {
			debug( 'waiting on products/plans fetch' );
			return;
		}
		if ( ! product ) {
			debug( 'there is a request to add a product but no product was found', productAlias );
			setState( { canInitializeCart: true } );
			return;
		}
		const cartProduct = createItemToAddToCart( {
			productAlias,
			product_id: product.product_id,
			isJetpackNotAtomic,
		} );
		debug(
			'preparing product that was requested in url',
			{ productAlias, isJetpackNotAtomic },
			cartProduct
		);
		setState( { productForCart: cartProduct, canInitializeCart: true } );
	}, [
		isFetchingPlans,
		planSlug,
		reduxDispatch,
		isJetpackNotAtomic,
		productAlias,
		product,
		products,
		isFetchingProducts,
	] );

	return { productForCart, canInitializeCart };
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
