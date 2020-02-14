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
} from '@automattic/composite-checkout-wpcom';
import {
	CheckoutProvider,
	createRegistry,
	createPayPalMethod,
	createStripeMethod,
	createFullCreditsMethod,
	createApplePayMethod,
	createExistingCardMethod,
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
import { getPlanBySlug } from 'state/plans/selectors';
import {
	useStoredCards,
	getDomainDetails,
	makePayPalExpressRequest,
	wpcomPayPalExpress,
	isPaymentMethodEnabled,
	fetchStripeConfiguration,
	sendStripeTransaction,
	wpcomTransaction,
	submitCreditsTransaction,
	WordPressCreditsLabel,
	WordPressCreditsSummary,
	submitApplePayPayment,
	isApplePayAvailable,
	submitExistingCardPayment,
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
	overrideCountryList,
	redirectTo,
	feature,
	purchaseId,
	cart,
	// TODO: handle these also
	// couponCode,
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

	const onPaymentComplete = useCallback( () => {
		debug( 'payment completed successfully' );
		page.redirect( getThankYouUrl() );
	}, [ getThankYouUrl ] );

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

	const countriesList = useCountryList( overrideCountryList || [] );

	const {
		items,
		tax,
		couponItem,
		total,
		credits,
		removeItem,
		addItem,
		submitCoupon,
		updateLocation,
		couponStatus,
		changeItemVariant,
		errors,
		subtotal,
		isLoading,
		allowedPaymentMethods: serverAllowedPaymentMethods,
		variantRequestStatus,
		variantSelectOverride,
	} = useShoppingCart(
		siteSlug,
		setCart || wpcomSetCart,
		getCart || wpcomGetCart,
		translate,
		showAddCouponSuccessMessage
	);

	const reduxDispatch = useDispatch();
	const recordEvent = useCallback( getCheckoutEventHandler( reduxDispatch ), [] );

	const { registerStore, dispatch } = registry;
	useWpcomStore(
		registerStore,
		recordEvent,
		validateDomainContactDetails || wpcomValidateDomainContactInformation
	);

	useDisplayErrors( errors, showErrorMessage );

	useAddProductToCart( planSlug, isJetpackNotAtomic, addItem );

	const itemsForCheckout = ( items.length ? [ ...items, tax, couponItem ] : [] ).filter( Boolean );
	debug( 'items for checkout', itemsForCheckout );

	useRedirectIfCartEmpty( items, `/plans/${ siteSlug || '' }` );

	const { storedCards, isLoading: isLoadingStoredCards } = useStoredCards(
		getStoredCards || wpcomGetStoredCards
	);

	const paypalMethod = useMemo( () => createPayPalMethod( { registerStore } ), [ registerStore ] );
	paypalMethod.id = 'paypal';
	// This is defined afterward so that getThankYouUrl can be dynamic without having to re-create payment method
	paypalMethod.submitTransaction = () =>
		makePayPalExpressRequest(
			{
				items,
				successUrl: getThankYouUrl(),
				cancelUrl: window.location.href,
				siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
				domainDetails: getDomainDetails( select ),
				couponId: null, // TODO: get couponId
				country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
				postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
				subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
			},
			wpcomPayPalExpress
		);

	const stripeMethod = useMemo(
		() =>
			createStripeMethod( {
				getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				registerStore,
				fetchStripeConfiguration: args => fetchStripeConfiguration( args, wpcom ),
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
			} ),
		[ registerStore, dispatch ]
	);
	stripeMethod.id = 'card';

	const fullCreditsPaymentMethod = useMemo(
		() =>
			createFullCreditsMethod( {
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
			} ),
		[ registerStore, dispatch ]
	);
	fullCreditsPaymentMethod.label = <WordPressCreditsLabel credits={ credits } />;
	fullCreditsPaymentMethod.inactiveContent = <WordPressCreditsSummary />;

	const applePayMethod = useMemo(
		() =>
			createApplePayMethod( {
				getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				registerStore,
				fetchStripeConfiguration: args => fetchStripeConfiguration( args, wpcom ),
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
			} ),
		[ registerStore, dispatch ]
	);

	const existingCardMethods = useMemo(
		() =>
			storedCards.map( storedDetails =>
				createExistingCardMethod( {
					id: `existingCard-${ storedDetails.stored_details_id }`,
					cardholderName: storedDetails.name,
					cardExpiry: storedDetails.expiry,
					brand: storedDetails.card_type,
					last4: storedDetails.card,
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
			),
		[ registerStore, storedCards, dispatch ]
	);

	const paymentMethods =
		isLoading || isLoadingStoredCards
			? []
			: [
					fullCreditsPaymentMethod,
					applePayMethod,
					...existingCardMethods,
					stripeMethod,
					paypalMethod,
			  ].filter( methodObject => {
					if ( methodObject.id === 'full-credits' ) {
						return credits.amount.value > 0 && credits.amount.value >= subtotal.amount.value;
					}
					if ( methodObject.id === 'apple-pay' && ! isApplePayAvailable() ) {
						return false;
					}
					if ( methodObject.id.startsWith( 'existingCard-' ) ) {
						return isPaymentMethodEnabled(
							'card',
							allowedPaymentMethods || serverAllowedPaymentMethods
						);
					}
					return isPaymentMethodEnabled(
						methodObject.id,
						allowedPaymentMethods || serverAllowedPaymentMethods
					);
			  } );

	const validateDomainContact =
		validateDomainContactDetails || wpcomValidateDomainContactInformation;

	const renderDomainContactFields = (
		domainNames,
		contactDetails,
		updateContactDetails,
		applyDomainContactValidationResults
	) => {
		return (
			<WPCheckoutErrorBoundary>
				<ContactDetailsFormFields
					countriesList={ countriesList }
					contactDetails={ contactDetails }
					onContactDetailsChange={ updateContactDetails }
					onValidate={ ( values, onComplete ) => {
						// TODO: Should probably handle HTTP errors here
						validateDomainContact( values, domainNames, ( httpErrors, data ) => {
							debug(
								'Domain contact info validation ' + ( data.messages ? 'errors:' : 'successful' ),
								data.messages
							);
							applyDomainContactValidationResults( { ...data.messages } );
							onComplete( httpErrors, data );
						} );
					} }
				/>
			</WPCheckoutErrorBoundary>
		);
	};

	const getItemVariants = useWpcomProductVariants( {
		siteId,
		productSlug: getPlanProductSlugs( items )[ 0 ],
	} );

	return (
		<React.Fragment>
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
				isLoading={ isLoading || isLoadingStoredCards }
			>
				<WPCheckout
					removeItem={ removeItem }
					updateLocation={ updateLocation }
					submitCoupon={ submitCoupon }
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
	cart: PropTypes.object,
	transaction: PropTypes.object,
};

function useAddProductToCart( planSlug, isJetpackNotAtomic, addItem ) {
	const dispatch = useDispatch();
	const plan = useSelector( state => getPlanBySlug( state, planSlug ) );

	useEffect( () => {
		if ( ! planSlug ) {
			return;
		}
		if ( ! plan ) {
			debug( 'there is a request to add a plan but no plan was found', planSlug );
			dispatch( requestPlans() );
			return;
		}
		debug( 'adding item as requested in url', { planSlug, plan, isJetpackNotAtomic } );
		addItem( createItemToAddToCart( { planSlug, plan, isJetpackNotAtomic } ) );
	}, [ dispatch, planSlug, plan, isJetpackNotAtomic, addItem ] );
}

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

	if ( planSlug ) {
		cartItem = planItem( planSlug );
		cartItem.product_id = plan.product_id;
	}

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
	return action => {
		debug( 'heard checkout event', action );
		switch ( action.type ) {
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
			case 'a8c_checkout_add_coupon_error':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_coupon_add_error', {
						error_type: action.payload.type,
					} )
				);
			case 'a8c_checkout_add_coupon_button_clicked':
				return dispatch( recordTracksEvent( 'calypso_checkout_composite_add_coupon_clicked', {} ) );
			case 'STEP_NUMBER_CHANGE_EVENT':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_step_changed', { step: action.payload } )
				);
			case 'STRIPE_TRANSACTION_BEGIN':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_stripe_button_clicked', {} )
				);
			case 'STRIPE_TRANSACTION_ERROR':
				return dispatch(
					recordTracksEvent( 'calypso_checkout_composite_stripe_transaction_error', {
						error_message: action.payload,
					} )
				);
			default:
				debug( 'unknown checkout event: not recording', action );
				return;
		}
	};
}

function useRedirectIfCartEmpty( items, redirectUrl ) {
	const [ prevItemsLength, setPrevItemsLength ] = useState( 0 );

	useEffect( () => {
		setPrevItemsLength( items.length );
	}, [ items ] );

	useEffect( () => {
		if ( prevItemsLength > 0 && items.length === 0 ) {
			debug( 'cart has become empty; redirecting...' );
			window.location = redirectUrl;
		}
	}, [ redirectUrl, items, prevItemsLength ] );
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
