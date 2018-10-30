/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import config from 'config';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SubscriptionText from 'my-sites/checkout/checkout/subscription-text';
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

/**
 * Web Payment method identifier.
 */
export const WEB_PAYMENT_BASIC_CARD_METHOD = 'basic-card';
export const WEB_PAYMENT_APPLE_PAY_METHOD = 'https://apple.com/apple-pay';

/**
 *
 */
const SUPPORTED_NETWORKS = [ 'visa', 'mastercard', 'amex' ];
const APPLE_PAY_MERCHANT_IDENTIFIER = 'merchant.com.wordpress.test';
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
 * @returns {string|null}                 A user-friendly payment name
 *                                        or the given payment method
 *                                        if none matches.
 */
export function getWebPaymentMethodName( webPaymentMethod ) {
	switch ( webPaymentMethod ) {
		case WEB_PAYMENT_BASIC_CARD_METHOD:
			return 'Browser wallet';

		case WEB_PAYMENT_APPLE_PAY_METHOD:
			return ' Apple Pay';

		default:
			return webPaymentMethod;
	}
}

/**
 * The `<WebPaymentBox />` component.
 */
export class WebPaymentBox extends React.Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		transactionStep: PropTypes.object.isRequired,
		onSubmit: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	buttonState = () => {
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
				throw new Error( 'Unknown transaction step: ' + transactionStep.name );
		}
	};

	getPaymentRequestForApplePay = () => {
		const { cart } = this.props;

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
				label: 'Total',
				amount: {
					currency: cart.currency,
					value: cart.total_cost + '',
				},
			},
			displayItems: cart.products.map( product => {
				return {
					label: product.product_name,
					amount: {
						currency: product.currency,
						value: product.cost + ''
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
				.then( json => {
					console.log( json );

					event.complete( json );
				} )
				.catch( error => {
					console.error( 'onmerchantvalidation error' );
					console.error( error );
				} );
		};

		return paymentRequest;
	};

	getPaymentRequestForBasicCard = () => {
		const { cart } = this.props;

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
				label: 'Total',
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
								console.log(paymentResponse);

								const { payerName, details } = paymentResponse;
								const { token } = details;

								if ( 'EC_v1' !== token.paymentData.version ) {
									return; // Not supported yet.
								}

								this.props.transaction.payment = newCardPayment( {
									tokenized_payment_data: token.paymentData,
									name: payerName,
									country: 'CH',
									'postal-code': '1350',
									card_brand: token.paymentMethod.network,
								} );

								setPayment( this.props.transaction.payment );

								this.props.onSubmit( event );

								paymentResponse.complete( 'success' );
							} )
							.catch( error => {
								console.error( 'show error' );
								console.error( error );
							} );
					} catch ( e ) {
						console.error( 'show catch' );
						console.error( e );
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

								this.props.transaction.payment = newCardPayment( cardRawDetails );

								paymentResponse.complete();

								return this.props.transaction.payment;
							} )
							.then( transactionPayment => {
								setPayment( transactionPayment );
								this.props.onSubmit( event );
							} )
							.catch( error => {
								console.error( error );
							} );
					} catch ( e ) {
						console.error( e );
					}
				}
				break;

			default:
				console.error( 'Unknown or unhandled payment method `' + paymentMethod + '`.' );
		}
	};

	render() {
		const paymentMethod = detectWebPaymentMethod();
		const { cart, translate } = this.props;

		if ( ! paymentMethod ) {
			return <></>;
		}

		const buttonState = this.buttonState();
		let introductionText;
		let button;

		switch ( paymentMethod ) {
			case WEB_PAYMENT_APPLE_PAY_METHOD:
				introductionText = translate(
					'Use your secure and private Apple Wallet to pick up a card to pay with. ' +
						'Once the button has been clicked, your browser will promt you a payment sheet. ' +
						'Please, follow this secure interface.'
				);

				if ( buttonState.default ) {
					button = (
						<button
							type="submit"
							onClick={ this.submit.bind( this, paymentMethod ) }
							disabled={ buttonState.disabled }
							className="web-payment-box__apple-pay-button"
						/>
					);
				} else {
					button = (
						<Button
							type="button"
							className="button is-primary button-pay pay-button__button"
							busy={ buttonState.disabled }
							disabled={ buttonState.disabled }
						>
							{ buttonState.text }
						</Button>
					);
				}
				break;

			case WEB_PAYMENT_BASIC_CARD_METHOD:
				introductionText = translate(
					'Use your private and safeguarded browser wallet to pick up a card to pay with. ' +
						'Once the button has been clicked, your browser will prompt you a payment sheet. ' +
						'Please, follow this secure interface.'
				);
				button = (
					<Button
						type="submit"
						className="button is-primary button-pay pay-button__button"
						onClick={ this.submit.bind( this, paymentMethod ) }
						busy={ buttonState.disabled }
						disabled={ buttonState.disabled }
					>
						{ buttonState.text }
					</Button>
				);
		}

		return (
			<form autoComplete="off">
				{ this.props.children }

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( cart ) }
				/>

				<span className="payment-box__payment-buttons">
					<span className="web-payment-box__button-explanation">{ introductionText }</span>
					<span className="pay-button">
						<span className="payment-request-button">{ button }</span>
						<SubscriptionText cart={ this.props.cart } />
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
	}
}

export default localize( WebPaymentBox );
