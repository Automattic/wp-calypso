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
	createRegistry,
	createPayPalMethod,
	createStripeMethod,
	createFullCreditsMethod,
	createFreePaymentMethod,
	createApplePayMethod,
	createExistingCardMethod,
} from '@automattic/composite-checkout';
import { recordTracksEvent } from 'state/analytics/actions';
import { format as formatUrl, parse as parseUrl } from 'url';

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
import { getPlanBySlug, getPlans } from 'state/plans/selectors';
import {
	useStoredCards,
	getDomainDetails,
	makePayPalExpressRequest,
	wpcomPayPalExpress,
	isPaymentMethodEnabled,
	sendStripeTransaction,
	wpcomTransaction,
	submitCreditsTransaction,
	submitFreePurchaseTransaction,
	WordPressCreditsLabel,
	WordPressCreditsSummary,
	WordPressFreePurchaseLabel,
	WordPressFreePurchaseSummary,
	submitApplePayPayment,
	submitExistingCardPayment,
	useIsApplePayAvailable,
} from './composite-checkout-payment-methods';
import notices from 'notices';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import { isJetpackSite, isNewSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import { FormCountrySelect } from 'components/forms/form-country-select';
import getCountries from 'state/selectors/get-countries';
import { fetchPaymentCountries } from 'state/countries/actions';
import { StateSelect } from 'my-sites/domains/components/form';
import ContactDetailsFormFields from 'components/domains/contact-details-form-fields';
import { getThankYouPageUrl } from './composite-checkout-thank-you';
import { getSelectedSite } from 'state/ui/selectors';
import isEligibleForSignupDestination from 'state/selectors/is-eligible-for-signup-destination';
import getPreviousPath from 'state/selectors/get-previous-path.js';
import { getPlan, findPlansKeys } from 'lib/plans';
import { GROUP_WPCOM, TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { computeProductsWithPrices } from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import analytics from 'lib/analytics';
import { useStripe } from 'lib/stripe';

const debug = debugFactory( 'calypso:composite-checkout' );

const registry = createRegistry();
const { select } = registry;

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
	const planSlug = useSelector( state => getUpgradePlanSlugFromPath( state, siteId, product ) );
	const isJetpackNotAtomic = useSelector(
		state => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const selectedSiteData = useSelector( state => getSelectedSite( state ) );
	const adminUrl = selectedSiteData?.options?.admin_url;
	const isNewlyCreatedSite = useSelector( state => isNewSite( state, siteId ) );
	const isEligibleForSignupDestinationResult = useSelector( state =>
		isEligibleForSignupDestination( state, siteId, cart )
	);
	const previousRoute = useSelector( state => getPreviousPath( state ) );
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();

	const getThankYouUrl = useCallback( () => {
		const transactionResult = select( 'wpcom' ).getTransactionResult();
		debug( 'for getThankYouUrl, transactionResult is', transactionResult );
		const didPurchaseFail = Object.keys( transactionResult.failed_purchases ?? {} ).length > 0;
		const receiptId = transactionResult.receipt_id;
		const orderId = transactionResult.order_id;

		debug( 'getThankYouUrl called with', {
			siteSlug,
			adminUrl,
			didPurchaseFail,
			receiptId,
			orderId,
			redirectTo,
			purchaseId,
			feature,
			cart,
			isJetpackNotAtomic,
			product,
			isNewlyCreatedSite,
			previousRoute,
			isEligibleForSignupDestination: isEligibleForSignupDestinationResult,
		} );
		const url = getThankYouPageUrl( {
			siteSlug,
			adminUrl,
			didPurchaseFail,
			receiptId,
			orderId,
			redirectTo,
			purchaseId,
			feature,
			cart,
			isJetpackNotAtomic,
			product,
			isNewlyCreatedSite,
			previousRoute,
			isEligibleForSignupDestination: isEligibleForSignupDestinationResult,
		} );
		debug( 'getThankYouUrl returned', url );
		return url;
	}, [
		previousRoute,
		isNewlyCreatedSite,
		isEligibleForSignupDestinationResult,
		siteSlug,
		adminUrl,
		isJetpackNotAtomic,
		product,
		redirectTo,
		feature,
		purchaseId,
		cart,
	] );

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

	useEffect( () => {
		if ( stripeLoadingError ) {
			debug( 'showing error for loading', stripeLoadingError );
			showErrorMessage( stripeLoadingError );
		}
	}, [ showErrorMessage, stripeLoadingError ] );

	const countriesList = useCountryList( overrideCountryList || [] );

	const { productForCart, canInitializeCart } = usePrepareProductForCart(
		planSlug,
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
		canInitializeCart,
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

	const { registerStore, dispatch } = registry;
	useWpcomStore(
		registerStore,
		recordEvent,
		areDomainsInLineItems( items ) ? domainManagedContactDetails : taxManagedContactDetails
	);

	useDisplayErrors( errors, showErrorMessage );

	const itemsForCheckout = ( items.length ? [ ...items, tax, couponItem ] : [] ).filter( Boolean );
	debug( 'items for checkout', itemsForCheckout );

	useRedirectIfCartEmpty( items, `/plans/${ siteSlug || '' }`, isLoadingCart );

	const { storedCards, isLoading: isLoadingStoredCards } = useStoredCards(
		getStoredCards || wpcomGetStoredCards
	);

	const shouldLoadPayPalMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'paypal' )
		: true;
	const paypalMethod = useMemo( () => {
		if ( ! shouldLoadPayPalMethod ) {
			return null;
		}
		return createPayPalMethod( { registerStore } );
	}, [ registerStore, shouldLoadPayPalMethod ] );
	if ( paypalMethod ) {
		paypalMethod.id = 'paypal';
		// This is defined afterward so that getThankYouUrl can be dynamic without having to re-create payment method
		paypalMethod.submitTransaction = () => {
			const { protocol, hostname, port, pathname } = parseUrl( window.location.href, true );
			const successUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname: getThankYouUrl(),
			} );
			const cancelUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname,
			} );

			return makePayPalExpressRequest(
				{
					items,
					successUrl,
					cancelUrl,
					siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
					domainDetails: getDomainDetails( select ),
					couponId: null, // TODO: get couponId
					country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
					postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
					subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
				},
				wpcomPayPalExpress
			);
		};
	}

	const shouldLoadStripeMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'card' )
		: true;
	const stripeMethod = useMemo( () => {
		if (
			isStripeLoading ||
			stripeLoadingError ||
			! stripe ||
			! stripeConfiguration ||
			! shouldLoadStripeMethod
		) {
			return null;
		}
		return createStripeMethod( {
			getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			registerStore,
			stripe,
			stripeConfiguration,
			submitTransaction: submitData => {
				const pending = sendStripeTransaction(
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
		} );
	}, [
		shouldLoadStripeMethod,
		registerStore,
		dispatch,
		stripe,
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
	] );
	if ( stripeMethod ) {
		stripeMethod.id = 'card';
	}

	const shouldLoadFullCreditsMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'full-credits' )
		: true;
	const fullCreditsPaymentMethod = useMemo( () => {
		if ( ! shouldLoadFullCreditsMethod ) {
			return null;
		}
		return createFullCreditsMethod( {
			registerStore,
			submitTransaction: submitData => {
				const pending = submitCreditsTransaction(
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
	}, [ registerStore, dispatch, shouldLoadFullCreditsMethod ] );
	if ( fullCreditsPaymentMethod ) {
		fullCreditsPaymentMethod.label = <WordPressCreditsLabel credits={ credits } />;
		fullCreditsPaymentMethod.inactiveContent = <WordPressCreditsSummary />;
	}

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
	}, [ registerStore, dispatch, shouldLoadFreePaymentMethod ] );
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
		dispatch,
		registerStore,
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
	}, [
		registerStore,
		stripeConfiguration,
		storedCards,
		dispatch,
		shouldLoadExistingCardsMethods,
	] );

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
					'Domain contact info validation ' + ( data.messages ? 'errors:' : 'successful' ),
					data.messages
				);
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
		shouldShowContactDetailsValidationErrors
	) => {
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
				registry={ registry }
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
 * @returns ResponseCartProduct
 */
function createItemToAddToCart( { planSlug, plan, isJetpackNotAtomic } ) {
	let cartItem, cartMeta;

	cartItem = planItem( planSlug );
	cartItem.product_id = plan.product_id;

	if ( planSlug.startsWith( 'theme' ) ) {
		cartMeta = planSlug.split( ':' )[ 1 ];
		cartItem = themeItem( cartMeta );
	}

	if ( planSlug.startsWith( 'domain-mapping' ) ) {
		cartMeta = planSlug.split( ':' )[ 1 ];
		cartItem = domainMapping( { domain: cartMeta } );
	}

	if ( planSlug.startsWith( 'concierge-session' ) ) {
		// TODO: prevent adding a conciergeSessionItem if one already exists
		cartItem = conciergeSessionItem();
	}

	if ( planSlug.startsWith( 'jetpack_backup' ) && isJetpackNotAtomic ) {
		cartItem = jetpackProductItem( planSlug );
	}

	cartItem.extra = { ...cartItem.extra, context: 'calypstore' };

	cartItem.uuid = 'unknown'; // This must be filled-in later

	return cartItem;
}

function getCheckoutEventHandler( dispatch ) {
	return function recordEvent( action ) {
		debug( 'heard checkout event', action );
		switch ( action.type ) {
			case 'CHECKOUT_LOADED':
				return dispatch( recordTracksEvent( 'calypso_checkout_composite_loaded', {} ) );

			case 'PAYMENT_COMPLETE': {
				const total_cost = action.payload.total.amount.value / 100; // TODO: This conversion only works for USD! We have to localize this or get it from the server directly (or better yet, just force people to use the integer version).

				dispatch(
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
					},
					orderId: transactionResult.receipt_id,
				} );

				return dispatch(
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

			case 'CART_ERROR':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_cart_error', {
						error_type: action.payload.type,
						error_message: String( action.payload.message ),
					} )
				);

			case 'a8c_checkout_error':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_error', {
						error_type: action.payload.type,
						error_field: action.payload.field,
						error_message: action.payload.message,
					} )
				);

			case 'a8c_checkout_add_coupon':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_coupon_add_submit', {
						coupon: action.payload.coupon,
					} )
				);

			case 'a8c_checkout_delete_product':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_delete_product', {
						product_name: action.payload.product_name,
					} )
				);

			case 'a8c_checkout_delete_product_press':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_delete_product_press', {
						product_name: action.payload.product_name,
					} )
				);

			case 'a8c_checkout_add_coupon_error':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_coupon_add_error', {
						error_type: action.payload.type,
					} )
				);

			case 'a8c_checkout_add_coupon_button_clicked':
				return dispatch( recordTracksEvent( 'calypso_checkout_composite_add_coupon_clicked', {} ) );

			case 'STEP_NUMBER_CHANGED':
				if ( action.payload.stepNumber === 2 && action.payload.previousStepNumber === 1 ) {
					dispatch(
						recordTracksEvent( 'calypso_checkout_composite_first_step_complete', {
							payment_method:
								translateCheckoutPaymentMethodToWpcomPaymentMethod( action.payload.paymentMethodId )
									?.name || '',
						} )
					);
				}
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_step_changed', {
						step: action.payload.stepNumber,
					} )
				);

			case 'STRIPE_TRANSACTION_BEGIN': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_stripe_submit_clicked', {} )
				);
			}

			case 'STRIPE_TRANSACTION_ERROR': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
						reason: String( action.payload ),
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_stripe_transaction_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'FREE_TRANSACTION_BEGIN': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_free_purchase_submit_clicked', {} )
				);
			}

			case 'FREE_PURCHASE_TRANSACTION_ERROR': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_WPCOM',
						reason: String( action.payload ),
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_free_purchase_transaction_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'PAYPAL_TRANSACTION_BEGIN': {
				dispatch( recordTracksEvent( 'calypso_checkout_form_redirect', {} ) );
				dispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_paypal_submit_clicked', {} )
				);
			}

			case 'PAYPAL_TRANSACTION_ERROR': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_PayPal_Express',
						reason: String( action.payload ),
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_paypal_transaction_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'FULL_CREDITS_TRANSACTION_BEGIN': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_WPCOM',
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_full_credits_submit_clicked', {} )
				);
			}

			case 'FULL_CREDITS_TRANSACTION_ERROR': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_WPCOM',
						reason: String( action.payload ),
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_full_credits_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'EXISTING_CARD_TRANSACTION_BEGIN': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_MoneyPress_Stored',
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_MoneyPress_Stored',
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_existing_card_submit_clicked', {} )
				);
			}

			case 'EXISTING_CARD_TRANSACTION_ERROR': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						payment_method: 'WPCOM_Billing_MoneyPress_Stored',
						reason: String( action.payload ),
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_existing_card_error', {
						error_message: String( action.payload ),
					} )
				);
			}

			case 'APPLE_PAY_TRANSACTION_BEGIN': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Web_Payment',
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_form_submit', {
						credits: null,
						payment_method: 'WPCOM_Billing_Web_Payment',
					} )
				);
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_apple_pay_submit_clicked', {} )
				);
			}

			case 'APPLE_PAY_LOADING_ERROR':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_apple_pay_error', {
						error_message: String( action.payload ),
						is_loading_error: true,
					} )
				);

			case 'APPLE_PAY_TRANSACTION_ERROR': {
				dispatch(
					recordTracksEvent( 'calypso_checkout_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				dispatch(
					recordTracksEvent( 'calypso_checkout_composite_payment_error', {
						error_code: null,
						reason: String( action.payload ),
					} )
				);
				return dispatch(
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
				return dispatch( recordTracksEvent( 'calypso_checkout_modal_authorization', {} ) );
			}

			default:
				debug( 'unknown checkout event', action );
				return dispatch(
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

	const dispatch = useDispatch();
	const globalCountryList = useSelector( state => getCountries( state, 'payments' ) );

	// Has the global list been populated?
	const isListFetched = globalCountryList?.length > 0;

	useEffect( () => {
		if ( shouldFetchList ) {
			if ( isListFetched ) {
				setCountriesList( globalCountryList );
			} else {
				debug( 'countries list is empty; dispatching request for data' );
				dispatch( fetchPaymentCountries() );
			}
		}
	}, [ shouldFetchList, isListFetched, globalCountryList, dispatch ] );

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
	const dispatch = useDispatch();

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
			dispatch( requestPlans() );
			dispatch( requestProductsList() );
			setHaveFetchedProducts( true );
		}
	}, [ shouldFetchProducts, haveFetchedProducts, dispatch ] );

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
	const dispatch = useDispatch();

	const chosenPlan = getPlan( productSlug );

	const [ haveFetchedPlans, setHaveFetchedPlans ] = useState( false );
	const shouldFetchPlans = ! chosenPlan;

	useEffect( () => {
		// Trigger at most one HTTP request
		debug( 'deciding whether to request plan variant data' );
		if ( shouldFetchPlans && ! haveFetchedPlans ) {
			debug( 'dispatching request for plan variant data' );
			dispatch( requestPlans() );
			dispatch( requestProductsList() );
			setHaveFetchedPlans( true );
		}
	}, [ haveFetchedPlans, shouldFetchPlans, dispatch ] );

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

function usePrepareProductForCart( planSlug, isJetpackNotAtomic ) {
	const plans = useSelector( state => getPlans( state ) );
	const plan = useSelector( state => getPlanBySlug( state, planSlug ) );
	const reduxDispatch = useDispatch();
	const [ canInitializeCart, setCanInitializeCart ] = useState( ! planSlug );
	const [ productForCart, setProductForCart ] = useState();

	// Fetch plans if they are not loaded
	useEffect( () => {
		if ( ! planSlug ) {
			return;
		}
		if ( ! plans || plans.length < 1 ) {
			debug( 'there is a request to add a plan but no plans are loaded; fetching plans' );
			reduxDispatch( requestPlans() );
			return;
		}
		if ( ! plan ) {
			debug( 'there is a request to add a plan but no plan was found' );
			setCanInitializeCart( true );
			return;
		}
		debug( 'preparing item that was requested in url', { planSlug, plan, isJetpackNotAtomic } );
		setProductForCart( createItemToAddToCart( { planSlug, plan, isJetpackNotAtomic } ) );
		setCanInitializeCart( true );
	}, [ reduxDispatch, planSlug, plan, plans, isJetpackNotAtomic ] );

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
