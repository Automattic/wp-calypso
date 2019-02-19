/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import config from 'config';
import Gridicon from 'gridicons';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SubscriptionText from 'my-sites/checkout/checkout/subscription-text';
import PaymentCountrySelect from 'components/payment-country-select';
import Input from 'my-sites/domains/components/form/input';
import TermsOfService from './terms-of-service';
import cartValues from 'lib/cart-values';
import wpcom from 'lib/wp';
import { newCardPayment } from 'lib/store-transactions';
import { setPayment } from 'lib/upgrades/actions';
import {
	BEFORE_SUBMIT,
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import RecentRenewals from './recent-renewals';
import DomainRegistrationRefundPolicy from './domain-registration-refund-policy';

const debug = debugFactory( 'calypso:checkout:payment:apple-pay' );

/**
 * Web Payment method identifier.
 */
export const WEB_PAYMENT_BASIC_CARD_METHOD = 'basic-card';
export const WEB_PAYMENT_APPLE_PAY_METHOD = 'https://apple.com/apple-pay';

/**
 * Supported card types.
 */
const SUPPORTED_NETWORKS = [ 'visa', 'mastercard', 'discover', 'amex', 'jcb', 'maestro' ];
const APPLE_PAY_MERCHANT_IDENTIFIER = config( 'apple_pay_merchant_id' );
const PAYMENT_REQUEST_OPTIONS = {
	requestPayerName: true,
	requestPayerPhone: false,
	requestPayerEmail: false,
	requestShipping: false,
};

/**
 * Returns an available Web Payment method.
 *
 * Web Payments (`PaymentRequest` API) are available only if the
 * document is served through HTTPS.
 *
 * The configuration features `my-sites/checkout/web-payment/*` must
 * also be enabled.
 *
 * @returns {string|null}  One of the `WEB_PAYMENT_*_METHOD` or `null`
 *                         if none can be detected.
 */
export function detectWebPaymentMethod() {
	if ( ! config.isEnabled( 'my-sites/checkout/web-payment' ) ) {
		return null;
	}

	if (
		config.isEnabled( 'my-sites/checkout/web-payment/apple-pay' ) &&
		window.ApplePaySession &&
		window.ApplePaySession.canMakePayments()
	) {
		return WEB_PAYMENT_APPLE_PAY_METHOD;
	}

	if ( config.isEnabled( 'my-sites/checkout/web-payment/basic-card' ) && window.PaymentRequest ) {
		return WEB_PAYMENT_BASIC_CARD_METHOD;
	}

	return null;
}

/**
 * Returns a user-friendly Web Payment method name.
 *
 * @param {string|null} webPaymentMethod  The payment method identifier
 *                                        (expecting one of the
 *                                        `WEB_PAYMENT_*_METHOD`
 *                                        constant).
 * @param {function} translate            Localization function to translate the label.
 * @returns {string|null}                 A user-friendly payment name
 *                                        or the given payment method
 *                                        if none matches.
 */
export function getWebPaymentMethodName( webPaymentMethod, translate ) {
	switch ( webPaymentMethod ) {
		case WEB_PAYMENT_BASIC_CARD_METHOD:
			return translate( 'Browser wallet' );

		case WEB_PAYMENT_APPLE_PAY_METHOD:
			return 'Apple Pay';

		default:
			return webPaymentMethod;
	}
}

/**
 * The `<WebPaymentBox />` component.
 */
export class WebPaymentBox extends React.Component {
	static propTypes = {
		cart: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			total_cost: PropTypes.number.isRequired,
			products: PropTypes.array.isRequired,
		} ).isRequired,
		transaction: PropTypes.shape( {
			payment: PropTypes.object,
		} ).isRequired,
		transactionStep: PropTypes.shape( {
			name: PropTypes.string.isRequired,
			error: PropTypes.object,
		} ).isRequired,
		countriesList: PropTypes.array.isRequired,
		onSubmit: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		country: null,
		postalCode: null,
	};

	constructor() {
		super();
		this.detectedPaymentMethod = detectWebPaymentMethod();
	}

	/**
	 * @return {object} A dictionnary containing `default`, `disabled` and `text` keys.
	 */
	getButtonState = () => {
		const { transactionStep, translate } = this.props;

		const defaultState = () => {
			return {
				default: true,
				disabled: false,
				text: translate( 'Select a payment card', {
					context: 'Loading state on /checkout',
				} ),
			};
		};
		const ongoingState = () => {
			return {
				default: false,
				disabled: true,
				text: translate( 'Sending your purchase', {
					context: 'Loading state on /checkout',
				} ),
			};
		};
		const completingState = () => {
			return {
				default: false,
				disabled: true,
				text: translate( 'Completing your purchase', {
					context: 'Loading state on /checkout',
				} ),
			};
		};

		switch ( transactionStep.name ) {
			case BEFORE_SUBMIT:
				return defaultState();

			case INPUT_VALIDATION:
				if ( transactionStep.error ) {
					return defaultState();
				}

				return ongoingState();

			case SUBMITTING_PAYMENT_KEY_REQUEST:
				return ongoingState();

			case RECEIVED_PAYMENT_KEY_RESPONSE:
				if ( transactionStep.error ) {
					return defaultState();
				}

				return ongoingState();

			case SUBMITTING_WPCOM_REQUEST:
				return completingState();

			case RECEIVED_WPCOM_RESPONSE:
				if ( transactionStep.error || ! transactionStep.data.success ) {
					return defaultState();
				}

				return completingState();

			default:
				throw new Error( `Unknown transaction step: ${ transactionStep.name }.` );
		}
	};

	/**
	 * @return {PaymentRequest} A configured payment request object.
	 */
	getPaymentRequestForApplePay = () => {
		const { cart, translate } = this.props;

		const supportedPaymentMethods = [
			{
				supportedMethods: WEB_PAYMENT_APPLE_PAY_METHOD,
				data: {
					version: 3,
					merchantIdentifier: APPLE_PAY_MERCHANT_IDENTIFIER,
					merchantCapabilities: [ 'supports3DS', 'supportsCredit', 'supportsDebit' ],
					supportedNetworks: SUPPORTED_NETWORKS,
					countryCode: 'US',
				},
			},
		];
		const paymentDetails = {
			total: {
				label: translate( 'Total' ),
				amount: {
					currency: cart.currency,
					value: cart.total_cost.toString(),
				},
			},
			displayItems: cart.products.map( product => {
				return {
					label: product.product_name,
					amount: {
						currency: product.currency,
						value: product.cost.toString(),
					},
				};
			} ),
		};

		const paymentRequest = new PaymentRequest(
			supportedPaymentMethods,
			paymentDetails,
			PAYMENT_REQUEST_OPTIONS
		);

		const environment = 'production' === config( 'env' ) ? undefined : 'sandbox';

		paymentRequest.onmerchantvalidation = event => {
			wpcom
				.undocumented()
				.applePayMerchantValidation( event.validationURL, environment )
				.then( json => event.complete( json ) )
				.catch( error => {
					debug( 'onmerchantvalidation error', error );
				} );
		};

		return paymentRequest;
	};

	/**
	 * @return {PaymentRequest} A configured payment request object.
	 */
	getPaymentRequestForBasicCard = () => {
		const { cart, translate } = this.props;

		const supportedPaymentMethods = [
			{
				supportedMethods: WEB_PAYMENT_BASIC_CARD_METHOD,
				data: {
					supportedNetworks: SUPPORTED_NETWORKS,
				},
			},
		];
		const paymentDetails = {
			total: {
				label: translate( 'Total' ),
				amount: {
					currency: cart.currency,
					value: cart.total_cost,
				},
			},
			displayItems: cart.products.map( product => {
				return {
					label: product.product_name,
					amount: {
						currency: product.currency,
						value: product.cost,
					},
				};
			} ),
		};

		return new PaymentRequest( supportedPaymentMethods, paymentDetails, PAYMENT_REQUEST_OPTIONS );
	};

	/**
	 * @param {string} paymentMethod  Payment method.
	 * @param {DOMEvent} event        Button even.
	 */
	submit = ( paymentMethod, event ) => {
		event.persist();
		event.preventDefault();

		switch ( paymentMethod ) {
			case WEB_PAYMENT_APPLE_PAY_METHOD:
				{
					const paymentRequest = this.getPaymentRequestForApplePay();

					try {
						paymentRequest
							.show()
							.then( paymentResponse => {
								const { payerName, details } = paymentResponse;
								const { token } = details;

								if ( 'EC_v1' !== token.paymentData.version ) {
									return; // Not supported yet.
								}

								const cardRawDetails = {
									tokenized_payment_data: token.paymentData,
									name: payerName,
									country: this.state.country,
									'postal-code': this.state.postalCode,
									card_brand: token.paymentMethod.network,
								};

								setPayment( newCardPayment( cardRawDetails ) );
								this.props.onSubmit( event );
								paymentResponse.complete( 'success' );
							} )
							.catch( error => {
								debug( 'Error while showing the payment request', error );
							} );
					} catch ( error ) {
						debug( 'Error while running the payment request', error );
					}
				}
				break;

			case WEB_PAYMENT_BASIC_CARD_METHOD:
				{
					const paymentRequest = this.getPaymentRequestForBasicCard();

					try {
						paymentRequest
							.show()
							.then( paymentResponse => {
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
								this.props.onSubmit( event );
								paymentResponse.complete();
							} )
							.catch( error => {
								debug( 'Error while showing the payment request', error );
							} );
					} catch ( error ) {
						debug( 'Error while running the payment request', error );
					}
				}
				break;

			default:
				debug( `Unknown or unhandled payment method ${ paymentMethod }.` );
		}
	};

	/**
	 * @param {string} key    Should only be `country`.
	 * @param {string} value  Should only be a country name.
	 */
	updateSelectedCountry = ( key, value ) => {
		if ( 'country' === key ) {
			this.setState( { country: value } );
		}
	};

	/**
	 * @param {object} event  Event object.
	 */
	updateSelectedPostalCode = event => {
		const { name: key, value } = event.target;

		if ( 'postal-code' === key ) {
			this.setState( { postalCode: value } );
		}
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const paymentMethod = this.detectedPaymentMethod;
		const { cart, translate, countriesList } = this.props;

		if ( ! paymentMethod ) {
			return null;
		}

		const buttonState = this.getButtonState();
		const buttonDisabled = buttonState.disabled || ! this.state.country || ! this.state.postalCode;
		let button;

		switch ( paymentMethod ) {
			case WEB_PAYMENT_APPLE_PAY_METHOD:
				if ( buttonState.default ) {
					button = (
						<button
							type="submit"
							onClick={ event => this.submit( paymentMethod, event ) }
							disabled={ buttonDisabled }
							className="web-payment-box__apple-pay-button"
						/>
					);
				} else {
					button = (
						<Button
							type="button"
							className="button is-primary button-pay pay-button__button"
							busy={ buttonState.disabled }
							disabled={ buttonDisabled }
						>
							{ buttonState.text }
						</Button>
					);
				}
				break;

			case WEB_PAYMENT_BASIC_CARD_METHOD:
				button = (
					<Button
						type="submit"
						className="button is-primary button-pay pay-button__button"
						onClick={ event => this.submit( paymentMethod, event ) }
						busy={ buttonState.disabled }
						disabled={ buttonDisabled }
					>
						{ buttonState.text }
					</Button>
				);
				break;

			default:
				debug( `Unknown payment method ${ paymentMethod }.` );
		}

		return (
			<form autoComplete="off">
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">
						<PaymentCountrySelect
							additionalClasses="checkout-field"
							name="country"
							label={ translate( 'Country', { textOnly: true } ) }
							countriesList={ countriesList }
							onCountrySelected={ this.updateSelectedCountry }
							eventFormName="Checkout Form"
						/>
						<Input
							additionalClasses="checkout-field"
							name="postal-code"
							label={ translate( 'Postal Code', { textOnly: true } ) }
							onChange={ this.updateSelectedPostalCode }
							eventFormName="Checkout Form"
						/>
					</div>
				</div>

				{ this.props.children }

				<RecentRenewals cart={ cart } />
				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( cart ) }
				/>
				<DomainRegistrationRefundPolicy cart={ cart } />

				<span className="payment-box__payment-buttons">
					<span className="pay-button">
						<span className="payment-request-button">{ button }</span>
						<SubscriptionText cart={ cart } />
					</span>
					<div className="checkout__secure-payment">
						<div className="checkout__secure-payment-content">
							<Gridicon icon="lock" />
							{ translate( 'Secure Payment' ) }
						</div>
					</div>
				</span>
			</form>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( WebPaymentBox );
