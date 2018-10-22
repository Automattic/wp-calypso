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
	requestPayerName: false,
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
		onSubmit: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
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

		const paymentRequest = new PaymentRequest(
			supportedPaymentMethods,
			paymentDetails,
			PAYMENT_REQUEST_OPTIONS
		);

		const environment = 'production' === config( 'env' ) ? undefined : 'sandbox';

		paymentRequest.onmerchantvalidation = merchantValidationEvent => {
			wpcom
				.undocumented()
				.applePayMerchantValidation( merchantValidationEvent.validationURL, environment )
				.then( json => {
					console.log( json );

					return merchantValidationEvent.complete( json );
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
								const { details } = paymentResponse;

								if ( 'EC_v1' !== details.token.paymentData.version ) {
									return; // Not supported yet.
								}

								/*
							const request = new Request(
								'/decrypt_token.php',
								{
									method: 'POST',
									headers: new Headers({'Content-Type': 'application/json'}),
									body: JSON.stringify(paymentResponse.details.token.paymentData),
									mode: 'cors',
									credentials: 'omit',
									cache: 'no-store',
								}
							);

							return fetch(request)
								.then(response => {
									if (200 !== response.status) {
										return; // error
									}

									return response.json();
								})
								.then(json => {
									console.log(json);

									return paymentResponse.complete('success');
								})
								.catch(error => {
									console.error('decrypt-token error');
									console.log(error);

									return paymentResponse.retry({
										'error': 'Cannot decrypt token.'
									});
								});
							*/
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

								// Map the `BasicCardResponse` dictionnary to `transaction.payment`.
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

		let introduction_text;
		let button;

		switch ( paymentMethod ) {
			case WEB_PAYMENT_APPLE_PAY_METHOD:
				introduction_text = translate(
					'Use your secure and private Apple Wallet to pick up a card to pay with. ' +
						'Once the button has been clicked, your browser will promt you a payment sheet. ' +
						'Please, follow this secure interface.'
				);
				button = (
					<button
						type="submit"
						onClick={ this.submit.bind( this, paymentMethod ) }
						className="web-payment-box__apple-pay-button"
					/>
				);
				break;

			case WEB_PAYMENT_BASIC_CARD_METHOD:
				introduction_text = translate(
					'Use your private and safeguarded browser wallet to pick up a card to pay with. ' +
						'Once the button has been clicked, your browser will prompt you a payment sheet. ' +
						'Please, follow this secure interface.'
				);
				button = (
					<Button
						type="submit"
						onClick={ this.submit.bind( this, paymentMethod ) }
						className="button is-primary button-pay pay-button__button"
					>
						{ translate( 'Select a payment card' ) }
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
					<span className="web-payment-box__button-explanation">{ introduction_text }</span>
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
