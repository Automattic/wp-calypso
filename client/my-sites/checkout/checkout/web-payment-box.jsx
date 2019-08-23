/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { useState, useEffect, useMemo } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import debugFactory from 'debug';
import { overSome, some } from 'lodash';

/**
 * Internal dependencies
 */
import PaymentCountrySelect from 'components/payment-country-select';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import Input from 'my-sites/domains/components/form/input';
import analytics from 'lib/analytics';
import { getTaxCountryCode, getTaxPostalCode, shouldShowTax } from 'lib/cart-values';
import {
	hasRenewalItem,
	hasDomainRegistration,
	hasOnlyDomainProducts,
} from 'lib/cart-values/cart-items';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'lib/plans';
import {
	detectWebPaymentMethod,
	WEB_PAYMENT_BASIC_CARD_METHOD,
	WEB_PAYMENT_APPLE_PAY_METHOD,
} from 'lib/web-payment';
import { webPayment } from 'lib/store-transactions';
import { setPayment, setStripeObject } from 'lib/upgrades/actions';
import { setTaxCountryCode, setTaxPostalCode } from 'lib/upgrades/actions/cart';
import CartToggle from './cart-toggle';
import CheckoutTerms from './checkout-terms';
import PaymentChatButton from './payment-chat-button';
import RecentRenewals from './recent-renewals';
import SubscriptionText from './subscription-text';
import classNames from 'classnames';
import { withStripe } from 'lib/stripe';

const debug = debugFactory( 'calypso:checkout:payment:apple-pay' );

const PAYMENT_REQUEST_OPTIONS = {
	requestPayerName: true,
	requestPayerPhone: false,
	requestPayerEmail: false,
	requestShipping: false,
};

const WebPayButtonWithStripe = withStripe( WebPayButton );

export function WebPaymentBox( {
	cart,
	countriesList,
	onSubmit,
	presaleChatAvailable,
	translate,
	children,
} ) {
	const paymentMethod = useMemo( () => detectWebPaymentMethod(), [] );

	const countryCode = getTaxCountryCode( cart );
	const postalCode = getTaxPostalCode( cart );

	if ( ! paymentMethod ) {
		return null;
	}
	const paymentType = getPaymentTypeFromPaymentMethod( paymentMethod );

	const hasBusinessPlanInCart = some( cart.products, ( { product_slug } ) =>
		overSome( isWpComBusinessPlan, isWpComEcommercePlan )( product_slug )
	);
	const showPaymentChatButton = presaleChatAvailable && hasBusinessPlanInCart;
	const testSealsCopy = 'variant' === abtest( 'checkoutSealsCopyBundle' );
	const moneyBackGuarantee = ! hasOnlyDomainProducts( cart ) && testSealsCopy;
	const paymentButtonClasses = classNames( 'payment-box__payment-buttons', {
		'payment-box__payment-buttons-variant': testSealsCopy,
	} );
	const secureText = testSealsCopy
		? translate( 'This is a secure 128-SSL encrypted connection' )
		: translate( 'Secure Payment' );

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
							onChange={ event => setTaxPostalCode( event.target.value.toString() ) }
							value={ getPostalCodeStringFromPostalCode( postalCode ) }
							eventFormName="Checkout Form"
						/>
					</div>
				</div>
				{ children }
				<RecentRenewals cart={ cart } />
				<CheckoutTerms cart={ cart } />
				<span className={ paymentButtonClasses }>
					<span className="pay-button">
						<span className="payment-request-button">
							<WebPayButtonWithStripe
								countryCode={ countryCode }
								postalCode={ postalCode }
								cart={ cart }
								onSubmit={ onSubmit }
								translate={ translate }
							/>
						</span>
						<SubscriptionText cart={ cart } />
					</span>
					{ moneyBackGuarantee && (
						<div className="checkout__secure-payment-content">
							<Gridicon icon="refresh" />
							<div className="checkout__money-back-guarantee">
								<div>{ translate( '30-day Money Back Guarantee' ) }</div>
								{ hasDomainRegistration( cart ) && (
									<div>{ translate( '(96 hrs for domains)' ) }</div>
								) }
							</div>
						</div>
					) }
					<div className="checkout__secure-payment">
						<div className="checkout__secure-payment-content">
							<Gridicon icon="lock" />
							{ secureText }
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
};

function WebPayButton( {
	stripe,
	isStripeLoading,
	stripeConfiguration,
	countryCode,
	postalCode,
	cart,
	onSubmit,
	translate,
} ) {
	const { currency, total_cost_integer, sub_total_integer, total_tax_integer } = cart;
	const isRenewal = hasRenewalItem( cart );
	const shouldDisplayItems = shouldShowTax( cart );
	useEffect( () => {
		stripe && setStripeObject( stripe, stripeConfiguration );
	}, [ stripe, stripeConfiguration ] );
	debug( 'rendering WebPayButton with postalCode', postalCode, 'and countryCode', countryCode );

	// We have to memoize these to prevent re-creating the paymentRequest
	const callback = useMemo(
		() => paymentMethodResponse => {
			analytics.tracks.recordEvent( 'calypso_checkout_apple_pay_submit_payment_sheet', {
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
	const paymentRequestOptions = usePaymentRequestOptions( {
		translate,
		sub_total_integer,
		total_tax_integer,
		total_cost_integer,
		countryCode,
		currency,
		shouldDisplayItems,
	} );
	const { paymentRequest, canMakePayment } = useStripePaymentRequest(
		stripe,
		paymentRequestOptions,
		callback
	);

	if ( ! stripe && ! isStripeLoading ) {
		throw new Error( 'Stripe is required but not available' );
	}
	if ( isStripeLoading || ! canMakePayment || ! postalCode || ! countryCode ) {
		return <LoadingPaymentRequestButton />;
	}
	return <PaymentRequestButton paymentRequest={ paymentRequest } isRenewal={ isRenewal } />;
}

WebPayButton.propTypes = {
	stripe: PropTypes.object,
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

// The react-stripe-elements PaymentRequestButtonElement cannot have its
// paymentRequest updated once it has been rendered, so this is a custom one.
// See: https://github.com/stripe/react-stripe-elements/issues/284
function PaymentRequestButton( { paymentRequest, isRenewal } ) {
	const onClick = event => {
		event.persist();
		event.preventDefault();
		analytics.tracks.recordEvent( 'calypso_checkout_apple_pay_open_payment_sheet', {
			is_renewal: isRenewal,
		} );
		paymentRequest.show();
	};
	return <button className="web-payment-box__apple-pay-button" onClick={ onClick } />;
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

function useStripePaymentRequest( stripe, paymentRequestOptions, callback ) {
	const [ canMakePayment, setCanMakePayment ] = useState( false );
	const [ paymentRequest, setPaymentRequest ] = useState();
	useEffect( () => {
		if ( ! stripe ) {
			return;
		}
		debug( 'creating paymentRequest', paymentRequestOptions );
		setCanMakePayment( false );
		const request = stripe.paymentRequest( paymentRequestOptions );
		request.canMakePayment().then( result => setCanMakePayment( !! result ) );
		request.on( 'paymentmethod', callback );
		setPaymentRequest( request );
	}, [ stripe, paymentRequestOptions, callback ] );
	return { paymentRequest, canMakePayment };
}

function LoadingPaymentRequestButton() {
	return <button className="web-payment-box__apple-pay-button" disabled />;
}

function completePaymentMethodTransaction( {
	countryCode,
	postalCode,
	onSubmit,
	complete,
	paymentMethod,
	payerName,
} ) {
	debug( 'received stripe paymentMethod', paymentMethod );
	debug( 'received stripe payerName', payerName );
	const { card, id } = paymentMethod;

	const newCardDetails = {
		payment_key: id,
		name: payerName,
		country: countryCode,
		'postal-code': postalCode,
		card_brand: card.brand,
		card_display_name: `${ card.brand } ${ card.last4 }`,
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
