/**
 * External dependencies
 */
import page from 'page';
import wp from 'lib/wp';
import React, { useMemo, useEffect, useState, useCallback } from 'react';
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
import { Card } from '@automattic/components';

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

	const countriesList = useCountryList( overrideCountryList || [] );

	const {
		items,
		tax,
		total,
		credits,
		removeItem,
		addItem,
		changePlanLength,
		errors,
		subtotal,
		isLoading,
		allowedPaymentMethods: serverAllowedPaymentMethods,
	} = useShoppingCart( siteSlug, setCart || wpcomSetCart, getCart || wpcomGetCart );

	const { registerStore, dispatch } = registry;
	useWpcomStore(
		registerStore,
		handleCheckoutEvent,
		validateDomainContactDetails || wpcomValidateDomainContactInformation
	);

	const errorMessages = useMemo( () => errors.map( error => error.message ), [ errors ] );
	useDisplayErrors( errorMessages, showErrorMessage );

	useAddProductToCart( planSlug, isJetpackNotAtomic, addItem );

	const itemsForCheckout = items.length ? [ ...items, tax ] : [];
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
				submitTransaction: submitData =>
					submitCreditsTransaction(
						{
							...submitData,
							siteId: select( 'wpcom' )?.getSiteId?.(),
							domainDetails: getDomainDetails( select ),
							// this data is intentionally empty so we do not charge taxes
							country: null,
							postalCode: null,
						},
						wpcomTransaction
					),
			} ),
		[ registerStore ]
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
				submitTransaction: submitData =>
					submitApplePayPayment(
						{
							...submitData,
							siteId: select( 'wpcom' )?.getSiteId?.(),
							domainDetails: getDomainDetails( select ),
						},
						wpcomTransaction
					),
			} ),
		[ registerStore ]
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
					submitTransaction: submitData =>
						submitExistingCardPayment(
							{
								...submitData,
								siteId: select( 'wpcom' )?.getSiteId?.(),
								storedDetailsId: storedDetails.stored_details_id,
								paymentMethodToken: storedDetails.mp_ref,
								paymentPartnerProcessorId: storedDetails.payment_partner,
								domainDetails: getDomainDetails( select ),
							},
							wpcomTransaction
						),
					registerStore,
					getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
					getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
					getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				} )
			),
		[ registerStore, storedCards ]
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

	return (
		<React.Fragment>
			<TestingBanner />
			<CheckoutProvider
				locale={ 'en-us' }
				items={ itemsForCheckout }
				total={ total }
				onPaymentComplete={ onPaymentComplete }
				showErrorMessage={ showErrorMessage }
				showInfoMessage={ showInfoMessage }
				showSuccessMessage={ showSuccessMessage }
				onEvent={ handleCheckoutEvent }
				paymentMethods={ paymentMethods }
				registry={ registry }
				isLoading={ isLoading || isLoadingStoredCards }
			>
				<WPCheckout
					removeItem={ removeItem }
					changePlanLength={ changePlanLength }
					siteId={ siteId }
					siteUrl={ siteSlug }
					CountrySelectMenu={ CountrySelectMenu }
					countriesList={ countriesList }
					StateSelect={ StateSelect }
					renderDomainContactFields={ renderDomainContactFields }
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
		errors.map( displayError );
	}, [ errors, displayError ] );
}

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

	return cartItem;
}

function handleCheckoutEvent( action ) {
	debug( 'checkout event', action );
	// TODO: record stats
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

function TestingBanner() {
	return (
		<Card
			className="composite-checkout__testing-banner"
			highlight="warning"
			href="https://github.com/Automattic/wp-calypso/issues/new?title=New%20checkout&body=%3C!--%20Thanks%20for%20filling%20your%20bug%20report%20for%20our%20New%20checkout!%20Pick%20a%20clear%20title%20(%22New%20checkout%3A%20Continue%20button%20not%20working%22)%20and%20proceed.%20--%3E%0A%0A%23%23%23%23%20Steps%20to%20reproduce%0A1.%20Starting%20at%20URL%3A%0A2.%0A3.%0A4.%0A%0A%23%23%23%23%20What%20I%20expected%0A%0A%0A%23%23%23%23%20What%20happened%20instead%0A%0A%0A%23%23%23%23%20Browser%20%2F%20OS%20version%0A%0A%0A%23%23%23%23%20Screenshot%20%2F%20Video%20(Optional)%0A%0A%40sirbrillig%2C%20%40nbloomf%2C%20%40fditrapani%20%0A"
		>
			Warning! This checkout is a new feature still in testing. If you encounter issues, please
			click here to report them.
		</Card>
	);
}
