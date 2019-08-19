/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import { localize } from 'i18n-calypso';
import config from 'config';
import Gridicon from 'gridicons';
import debugFactory from 'debug';
import { overSome, some } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PaymentCountrySelect from 'components/payment-country-select';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import Input from 'my-sites/domains/components/form/input';
import analytics from 'lib/analytics';
import { getTaxCountryCode, getTaxPostalCode, shouldShowTax } from 'lib/cart-values';
import { hasRenewalItem } from 'lib/cart-values/cart-items';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'lib/plans';
import {
	detectWebPaymentMethod,
	WEB_PAYMENT_BASIC_CARD_METHOD,
	WEB_PAYMENT_APPLE_PAY_METHOD,
} from 'lib/web-payment';
import wpcom from 'lib/wp';
import { newCardPayment } from 'lib/store-transactions';
import { setPayment } from 'lib/upgrades/actions';
import {
	BEFORE_SUBMIT,
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	REDIRECTING_FOR_AUTHORIZATION,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import notices from 'notices';
import CartToggle from './cart-toggle';
import CheckoutTerms from './checkout-terms';
import PaymentChatButton from './payment-chat-button';
import RecentRenewals from './recent-renewals';
import SubscriptionText from './subscription-text';
import { setTaxCountryCode, setTaxPostalCode } from 'lib/upgrades/actions/cart';

const debug = debugFactory( 'calypso:checkout:payment:apple-pay' );

/**
 * Supported card types.
 */
const SUPPORTED_NETWORKS = [ 'visa', 'masterCard', 'discover', 'amex', 'jcb', 'chinaUnionPay' ];
const APPLE_PAY_MERCHANT_IDENTIFIER = config( 'apple_pay_merchant_id' );
const PAYMENT_REQUEST_OPTIONS = {
	requestPayerName: true,
	requestPayerPhone: false,
	requestPayerEmail: false,
	requestShipping: false,
};

export function WebPaymentBox( {
	cart,
	transactionStep,
	countriesList,
	onSubmit,
	presaleChatAvailable,
	translate,
	children,
} ) {
	const [ processorCountry, setProcessorCountry ] = useState( 'US' );
	const paymentMethod = useMemo( () => detectWebPaymentMethod(), [] );

	const countryCode = getTaxCountryCode( cart );
	const postalCode = getTaxPostalCode( cart );
	const postalCodeValue =
		typeof postalCode === 'undefined' || postalCode === null ? '' : postalCode;

	const updateSelectedPostalCode = event => {
		if ( 'postal-code' === event.target.name ) {
			setTaxPostalCode( event.target.value.toString() );
		}
	};

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
								updateSelectedCountry( { selectedCountryCode, setProcessorCountry } )
							}
							value={ countryCode }
							eventFormName="Checkout Form"
						/>
						<Input
							additionalClasses="checkout-field"
							name="postal-code"
							label={ translate( 'Postal Code', { textOnly: true } ) }
							onChange={ updateSelectedPostalCode }
							value={ postalCodeValue }
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
							<WebPayButton
								paymentMethod={ paymentMethod }
								transactionStep={ transactionStep }
								countryCode={ countryCode }
								postalCode={ postalCode }
								processorCountry={ processorCountry }
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
	transactionStep: PropTypes.shape( {
		name: PropTypes.string.isRequired,
		error: PropTypes.object,
	} ).isRequired,
	countriesList: PropTypes.array.isRequired,
	onSubmit: PropTypes.func.isRequired,
	presaleChatAvailable: PropTypes.bool,
	translate: PropTypes.func.isRequired,
};

function WebPayButton( {
	paymentMethod,
	transactionStep,
	countryCode,
	postalCode,
	processorCountry,
	cart,
	onSubmit,
	translate,
} ) {
	const buttonState = getButtonStateFromTransactionStep( { transactionStep, translate } );
	const displaySubmissionError = ( errorMessage, event ) => {
		event.preventDefault();
		notices.error( errorMessage );
	};

	switch ( paymentMethod ) {
		case WEB_PAYMENT_APPLE_PAY_METHOD:
			if ( buttonState.default ) {
				return (
					<button
						type="submit"
						onClick={ event =>
							! countryCode || ! postalCode
								? displaySubmissionError(
										translate( 'Please specify a country and postal code.' ),
										event
								  )
								: submitForm( {
										paymentMethod,
										event,
										processorCountry,
										cart,
										onSubmit,
										translate,
								  } )
						}
						disabled={ buttonState.disabled }
						className="web-payment-box__apple-pay-button"
					/>
				);
			}
			return (
				<Button
					type="button"
					className="button is-primary button-pay pay-button__button" // eslint-disable-line wpcalypso/jsx-classname-namespace
					busy={ buttonState.disabled }
					disabled={ buttonState.disabled }
				>
					{ buttonState.text }
				</Button>
			);

		case WEB_PAYMENT_BASIC_CARD_METHOD:
			return (
				<Button
					type="submit"
					className="button is-primary button-pay pay-button__button" // eslint-disable-line wpcalypso/jsx-classname-namespace
					onClick={ event =>
						submitForm( { paymentMethod, event, processorCountry, cart, onSubmit, translate } )
					}
					busy={ buttonState.disabled }
					disabled={ buttonState.disabled }
				>
					{ buttonState.text }
				</Button>
			);

		default:
			debug( `Unknown payment method ${ paymentMethod }.` );
	}
}

WebPayButton.propTypes = {
	paymentMethod: PropTypes.string.isRequired,
	transactionStep: PropTypes.shape( {
		name: PropTypes.string.isRequired,
		error: PropTypes.object,
	} ).isRequired,
	countryCode: PropTypes.string,
	postalCode: PropTypes.string,
	processorCountry: PropTypes.string,
	cart: PropTypes.shape( {
		currency: PropTypes.string.isRequired,
		total_cost: PropTypes.number.isRequired,
		products: PropTypes.array.isRequired,
	} ).isRequired,
	onSubmit: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

const getDefaultButtonState = translate => {
	return {
		default: true,
		disabled: false,
		text: translate( 'Select a payment card', {
			context: 'Loading state on /checkout',
		} ),
	};
};

const getOngoingButtonState = translate => {
	return {
		default: false,
		disabled: true,
		text: translate( 'Sending your purchase', {
			context: 'Loading state on /checkout',
		} ),
	};
};

const getCompletingButtonState = translate => {
	return {
		default: false,
		disabled: true,
		text: translate( 'Completing your purchase', {
			context: 'Loading state on /checkout',
		} ),
	};
};

function getButtonStateFromTransactionStep( { transactionStep, translate } ) {
	switch ( transactionStep.name ) {
		case BEFORE_SUBMIT:
			return getDefaultButtonState( translate );

		case INPUT_VALIDATION:
			if ( transactionStep.error ) {
				return getDefaultButtonState( translate );
			}

			return getOngoingButtonState( translate );

		case SUBMITTING_PAYMENT_KEY_REQUEST:
			return getOngoingButtonState( translate );

		case RECEIVED_PAYMENT_KEY_RESPONSE:
			if ( transactionStep.error ) {
				return getDefaultButtonState( translate );
			}

			return getOngoingButtonState( translate );

		case SUBMITTING_WPCOM_REQUEST:
		case REDIRECTING_FOR_AUTHORIZATION:
			return getCompletingButtonState( translate );

		case RECEIVED_WPCOM_RESPONSE:
			if ( transactionStep.error || ! transactionStep.data.success ) {
				return getDefaultButtonState( translate );
			}

			return getCompletingButtonState( translate );

		default:
			throw new Error( `Unknown transaction step: ${ transactionStep.name }.` );
	}
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

async function submitForm( { paymentMethod, event, processorCountry, cart, onSubmit, translate } ) {
	event.persist();
	event.preventDefault();

	try {
		switch ( paymentMethod ) {
			case WEB_PAYMENT_APPLE_PAY_METHOD:
				return submitFormWithApplePayMethod( { cart, processorCountry, translate, onSubmit } );
			case WEB_PAYMENT_BASIC_CARD_METHOD:
				return submitFormWithBasicCardMethod( { cart, translate, onSubmit } );
			default:
				debug( `Unknown or unhandled payment method ${ paymentMethod }.` );
		}
	} catch ( error ) {
		debug( 'Error while running the payment request', error );
	}
}

async function submitFormWithApplePayMethod( { cart, processorCountry, translate, onSubmit } ) {
	const is_renewal = hasRenewalItem( cart );
	analytics.tracks.recordEvent( 'calypso_checkout_apple_pay_open_payment_sheet', {
		is_renewal,
	} );

	const paymentResponse = await getPaymentRequestForApplePay( {
		processorCountry,
		cart,
		translate,
	} ).show();
	analytics.tracks.recordEvent( 'calypso_checkout_apple_pay_submit_payment_sheet', {
		is_renewal,
	} );

	const { payerName, details } = paymentResponse;
	const { token } = details;

	if ( 'EC_v1' !== token.paymentData.version ) {
		return; // Not supported yet.
	}

	const cardRawDetails = {
		tokenized_payment_data: token.paymentData,
		name: payerName,
		country: getTaxCountryCode( cart ),
		'postal-code': getTaxPostalCode( cart ),
		card_brand: token.paymentMethod.network,
		card_display_name: token.paymentMethod.displayName,
	};

	setPayment( newCardPayment( cardRawDetails ) );
	onSubmit( event );
	paymentResponse.complete( 'success' );
}

async function submitFormWithBasicCardMethod( { cart, translate, onSubmit } ) {
	const paymentResponse = await getPaymentRequestForBasicCard( cart, translate ).show();
	const { details } = paymentResponse;
	const { billingAddress } = details;

	const cardRawDetails = {
		number: details.cardNumber,
		cvv: details.cardSecurityCode,
		'expiration-date': details.expiryMonth + '/' + details.expiryYear.substr( 2 ),
		name: details.cardholderName,
		country: billingAddress.country,
		'postal-code': billingAddress.postalCode,
	};

	setPayment( newCardPayment( cardRawDetails ) );
	onSubmit( event );
	paymentResponse.complete();
}

function updateSelectedCountry( { selectedCountryCode, setProcessorCountry } ) {
	setTaxCountryCode( selectedCountryCode );

	// Apple Pay needs the country where the payment will be processed
	// (https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrequest/2951833-countrycode),
	// so call the Paygate configuration API endpoint to get that. This
	// information is only needed when the user clicks the button to buy
	// something and opens the Apple Pay payment sheet, so it is somewhat
	// wasteful to call it here (every time a new country is selected);
	// however, it is necessary because browsers will only open a payment
	// sheet in direct response to user input (see
	// https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/show),
	// so we can't delay the opening of the payment sheet on waiting for
	// the response to this API call.
	wpcom.undocumented().paygateConfiguration(
		{
			request_type: 'new_purchase',
			country: selectedCountryCode,
			// The endpoint also accepts an optional credit card brand in
			// cases where the processor country might depend on the card
			// brand used, but unfortunately we can't send that because we
			// don't know it yet (it's a chicken and egg problem; the user
			// only selects a credit card once the Apple Pay payment sheet
			// is open, but we need to send Apple Pay the processor country
			// in order to open the payment sheet). Fortunately, in most
			// cases this won't have a practical effect.
		},
		function( configError, configuration ) {
			let processorCountry = 'US';
			if ( ! configError && configuration.processor === 'stripe_ie' ) {
				processorCountry = 'IE';
			}
			setProcessorCountry( processorCountry );
		}
	);
}

function getPaymentRequestForApplePay( { processorCountry, cart, translate } ) {
	const supportedPaymentMethods = [
		{
			supportedMethods: WEB_PAYMENT_APPLE_PAY_METHOD,
			data: {
				version: 2,
				merchantIdentifier: APPLE_PAY_MERCHANT_IDENTIFIER,
				merchantCapabilities: [ 'supports3DS', 'supportsCredit', 'supportsDebit' ],
				supportedNetworks: SUPPORTED_NETWORKS,
				countryCode: processorCountry,
			},
		},
	];

	const paymentDetails = getPaymentDetails( cart, translate );

	const paymentRequest = new PaymentRequest(
		supportedPaymentMethods,
		paymentDetails,
		PAYMENT_REQUEST_OPTIONS
	);

	paymentRequest.onmerchantvalidation = event => {
		wpcom
			.undocumented()
			.applePayMerchantValidation( event.validationURL )
			.then( json => event.complete( json ) )
			.catch( error => {
				debug( 'onmerchantvalidation error', error );
			} );
	};

	return paymentRequest;
}

function getPaymentRequestForBasicCard( cart, translate ) {
	const supportedPaymentMethods = [
		{
			supportedMethods: WEB_PAYMENT_BASIC_CARD_METHOD,
			data: {
				supportedNetworks: SUPPORTED_NETWORKS,
			},
		},
	];
	const paymentDetails = getPaymentDetails( cart, translate );
	return new PaymentRequest( supportedPaymentMethods, paymentDetails, PAYMENT_REQUEST_OPTIONS );
}

/**
 * Returns line items to display on the payment sheet during purchase authorization.
 *
 * @param {object} cart The cart object.
 * @param {function} translate The translate function
 * @return {object} A dictionary containing `displayItems` and `total` keys.
 */
function getPaymentDetails( cart, translate ) {
	let displayItems = [];
	if ( shouldShowTax( cart ) ) {
		displayItems = [
			{
				label: translate( 'Subtotal' ),
				amount: {
					currency: cart.currency,
					value: cart.sub_total,
				},
			},
			{
				label: translate( 'Tax', { comment: 'The tax amount line-item in payment request' } ),
				amount: {
					currency: cart.currency,
					value: cart.total_tax,
				},
			},
		];
	}

	return {
		displayItems: displayItems,
		total: {
			label: translate( 'WordPress.com' ),
			amount: {
				currency: cart.currency,
				value: cart.total_cost,
			},
		},
	};
}

export default localize( WebPaymentBox );
