/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useMemo } from 'react';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
import { overSome, some } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import PaymentCountrySelect from 'components/payment-country-select';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import Input from 'my-sites/domains/components/form/input';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { getTaxCountryCode, getTaxPostalCode, shouldShowTax } from 'lib/cart-values';
import { hasRenewalItem } from 'lib/cart-values/cart-items';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'lib/plans';
import {
	detectWebPaymentMethod,
	WEB_PAYMENT_BASIC_CARD_METHOD,
	WEB_PAYMENT_APPLE_PAY_METHOD,
} from 'lib/web-payment';
import { webPayment } from 'lib/transaction/payments';
import { setPayment, setStripeObject } from 'lib/transaction/actions';
import { setTaxCountryCode, setTaxPostalCode } from 'lib/cart/actions';
import CartToggle from './cart-toggle';
import CheckoutTerms from './checkout-terms';
import PaymentChatButton from './payment-chat-button';
import RecentRenewals from './recent-renewals';
import PaymentRequestButton from './payment-request-button';
import SubscriptionText from './subscription-text';
import { useDebounce } from 'blocks/credit-card-form/helpers';
import { useStripe, StripeHookProvider } from 'lib/stripe';

const debug = debugFactory( 'calypso:checkout:payment:web-payment-box' );

const PAYMENT_REQUEST_OPTIONS = {
	requestPayerName: true,
	requestPayerPhone: false,
	requestPayerEmail: false,
	requestShipping: false,
};

export function WebPaymentBox( {
	cart,
	countriesList,
	onSubmit,
	presaleChatAvailable,
	translate,
	disablePostalCodeDebounce,
	children,
} ) {
	const paymentMethod = detectWebPaymentMethod();

	const countryCode = getTaxCountryCode( cart );
	const postalCode = getTaxPostalCode( cart );

	const [ postalCodeInputValue, setPostalCodeInputValue ] = useState( postalCode );
	const [ debouncedPostalCode ] = useDebounce( postalCodeInputValue, 400 );
	useEffect( () => {
		setTaxPostalCode( debouncedPostalCode );
	}, [ debouncedPostalCode ] );
	const updatePostalCode = ( event ) => {
		const value = event.target.value;
		if ( disablePostalCodeDebounce ) {
			setTaxPostalCode( value );
		}
		setPostalCodeInputValue( value );
	};

	if ( ! paymentMethod ) {
		return null;
	}
	const paymentType = getPaymentTypeFromPaymentMethod( paymentMethod );

	const hasBusinessPlanInCart = some( cart.products, ( { product_slug } ) =>
		overSome( isWpComBusinessPlan, isWpComEcommercePlan )( product_slug )
	);
	const showPaymentChatButton = presaleChatAvailable && hasBusinessPlanInCart;

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<React.Fragment>
			<form>
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">
						<PaymentCountrySelect
							additionalClasses="checkout-field"
							name="country"
							label={ translate( 'Country', { textOnly: true } ) }
							countriesList={ countriesList }
							onCountrySelected={ ( fieldName, selectedCountryCode ) =>
								setTaxCountryCode( selectedCountryCode )
							}
							value={ countryCode }
							eventFormName="Checkout Form"
						/>
						<Input
							additionalClasses="checkout-field"
							name="postal-code"
							label={ translate( 'Postal Code', { textOnly: true } ) }
							onChange={ updatePostalCode }
							value={ getPostalCodeStringFromPostalCode( postalCodeInputValue ) }
							eventFormName="Checkout Form"
						/>
					</div>
				</div>
				{ children }
				<RecentRenewals cart={ cart } />
				<CheckoutTerms cart={ cart } />
				<span className={ 'payment-box__payment-buttons' }>
					<span className="pay-button">
						<span className="payment-request-button">
							<StripeHookProvider>
								<WebPayButton
									countryCode={ countryCode }
									postalCode={ disablePostalCodeDebounce ? postalCode : debouncedPostalCode }
									cart={ cart }
									onSubmit={ onSubmit }
									paymentType={ paymentType }
									translate={ translate }
								/>
							</StripeHookProvider>
						</span>
						<SubscriptionText cart={ cart } />
					</span>
					<div className="checkout__secure-payment">
						<div className="checkout__secure-payment-content">
							<Gridicon icon="lock" />
							{ translate( 'Secure Payment' ) }
						</div>
					</div>

					{ showPaymentChatButton && (
						<PaymentChatButton paymentType={ paymentType } cart={ cart } />
					) }
				</span>
			</form>
			<CartCoupon cart={ cart } />
			<CartToggle />
		</React.Fragment>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

WebPaymentBox.propTypes = {
	cart: PropTypes.shape( {
		currency: PropTypes.string.isRequired,
		total_cost: PropTypes.number.isRequired,
		products: PropTypes.array.isRequired,
	} ).isRequired,
	countriesList: PropTypes.array.isRequired,
	onSubmit: PropTypes.func.isRequired,
	presaleChatAvailable: PropTypes.bool,
	translate: PropTypes.func.isRequired,
	disablePostalCodeDebounce: PropTypes.bool,
};

function WebPayButton( { countryCode, postalCode, cart, onSubmit, paymentType, translate } ) {
	const { currency, total_cost_integer, sub_total_integer, total_tax_integer } = cart;
	const isRenewal = hasRenewalItem( cart );
	const shouldDisplayItems = shouldShowTax( cart );
	const { stripe, stripeConfiguration, isStripeLoading } = useStripe();
	useEffect( () => {
		stripe && setStripeObject( stripe, stripeConfiguration );
	}, [ stripe, stripeConfiguration ] );

	const paymentRequestOptions = usePaymentRequestOptions( {
		translate,
		sub_total_integer,
		total_tax_integer,
		total_cost_integer,
		countryCode: getProcessorCountryFromStripeConfiguration( stripeConfiguration ),
		currency,
		shouldDisplayItems,
	} );
	const { paymentRequest, canMakePayment } = useStripePaymentRequest( {
		stripe,
		paymentRequestOptions,
		countryCode,
		postalCode,
		onSubmit,
		isRenewal,
	} );

	if ( ! stripe && ! isStripeLoading ) {
		throw new Error( 'Stripe is required but not available' );
	}
	const disabledReason = getDisabledReason( {
		isStripeLoading,
		canMakePayment,
		postalCode,
		countryCode,
		translate,
	} );
	return (
		<PaymentRequestButton
			paymentRequest={ paymentRequest }
			isRenewal={ isRenewal }
			paymentType={ paymentType }
			translate={ translate }
			disabled={ !! disabledReason }
			disabledReason={ disabledReason }
		/>
	);
}

WebPayButton.propTypes = {
	countryCode: PropTypes.string,
	postalCode: PropTypes.string,
	cart: PropTypes.shape( {
		currency: PropTypes.string.isRequired,
		total_cost: PropTypes.number.isRequired,
		products: PropTypes.array.isRequired,
	} ).isRequired,
	onSubmit: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

function getProcessorCountryFromStripeConfiguration( stripeConfiguration ) {
	return stripeConfiguration && stripeConfiguration.processor_id === 'stripe_ie' ? 'IE' : 'US';
}

function getDisabledReason( {
	isStripeLoading,
	canMakePayment,
	postalCode,
	countryCode,
	translate,
} ) {
	if ( isStripeLoading ) {
		return translate( 'Loading…' );
	}
	if ( ! canMakePayment ) {
		return translate( 'This payment method is unavailable' );
	}
	if ( ! postalCode || ! countryCode ) {
		return translate( 'Please specify a country and postal code' );
	}
	return null;
}

function getPostalCodeStringFromPostalCode( postalCode ) {
	return typeof postalCode === 'undefined' || postalCode === null ? '' : postalCode;
}

function usePaymentRequestOptions( {
	translate,
	sub_total_integer,
	total_tax_integer,
	total_cost_integer,
	countryCode,
	currency,
	shouldDisplayItems,
} ) {
	const displayItems = useMemo(
		() => getDisplayItems( { translate, sub_total_integer, total_tax_integer } ),
		[ translate, sub_total_integer, total_tax_integer ]
	);
	const paymentRequestOptions = useMemo(
		() => ( {
			country: countryCode || 'US',
			currency: currency.toLowerCase(),
			displayItems: shouldDisplayItems ? displayItems : [],
			total: getPaymentRequestTotalFromCart( { total_cost_integer }, translate ),
			...PAYMENT_REQUEST_OPTIONS,
		} ),
		[ translate, countryCode, currency, total_cost_integer, displayItems, shouldDisplayItems ]
	);
	return paymentRequestOptions;
}

function useStripePaymentRequest( {
	stripe,
	paymentRequestOptions,
	countryCode,
	postalCode,
	onSubmit,
	isRenewal,
} ) {
	const [ canMakePayment, setCanMakePayment ] = useState( false );
	const [ paymentRequest, setPaymentRequest ] = useState();

	// We have to memoize this to prevent re-creating the paymentRequest
	const callback = useMemo(
		() => ( paymentMethodResponse ) => {
			recordTracksEvent( 'calypso_checkout_apple_pay_submit_payment_sheet', {
				is_renewal: isRenewal,
			} );
			completePaymentMethodTransaction( {
				countryCode,
				postalCode,
				onSubmit,
				...paymentMethodResponse,
			} );
		},
		[ countryCode, postalCode, onSubmit, isRenewal ]
	);

	useEffect( () => {
		let isSubscribed = true;
		if ( ! stripe ) {
			return;
		}
		debug( 'creating paymentRequest', paymentRequestOptions );
		setCanMakePayment( false );
		const request = stripe.paymentRequest( paymentRequestOptions );
		request.canMakePayment().then( ( result ) => {
			isSubscribed && setCanMakePayment( !! result );
		} );
		request.on( 'paymentmethod', callback );
		setPaymentRequest( request );
		return () => ( isSubscribed = false );
	}, [ stripe, paymentRequestOptions, callback ] );

	return { paymentRequest, canMakePayment };
}

function completePaymentMethodTransaction( {
	countryCode,
	postalCode,
	onSubmit,
	complete,
	paymentMethod,
	payerName,
} ) {
	const { id } = paymentMethod;

	const newCardDetails = {
		payment_key: id,
		name: payerName,
		country: countryCode,
		'postal-code': postalCode,
	};
	debug( 'setting newCardDetails', newCardDetails );
	setPayment( webPayment( newCardDetails ) );

	// setStripeObject and setPayment use the Flux Dispatcher so they are
	// deferred.  This defers the submit so it will occur after the Flux actions
	// take effect.
	setTimeout( () => onSubmit(), 0 );

	complete( 'success' );
}

function getPaymentTypeFromPaymentMethod( paymentMethod ) {
	switch ( paymentMethod ) {
		case WEB_PAYMENT_APPLE_PAY_METHOD:
			return 'apple-pay';

		case WEB_PAYMENT_BASIC_CARD_METHOD:
			return 'web-payment';

		default:
			debug( `Unknown payment method ${ paymentMethod }.` );
			return '';
	}
}

function getPaymentRequestTotalFromCart( cart, translate ) {
	return {
		label: translate( 'WordPress.com' ),
		amount: cart.total_cost_integer ? cart.total_cost_integer : 0,
	};
}

function getDisplayItems( { translate, sub_total_integer, total_tax_integer } ) {
	return [
		{
			label: translate( 'Subtotal' ),
			amount: sub_total_integer,
		},
		{
			label: translate( 'Tax', { comment: 'The tax amount line-item in payment request' } ),
			amount: total_tax_integer,
		},
	];
}

export default localize( WebPaymentBox );
