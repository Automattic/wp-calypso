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
import { overSome, some } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PaymentCountrySelect from 'components/payment-country-select';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import Input from 'my-sites/domains/components/form/input';
import analytics from 'lib/analytics';
import { cartItems, getTaxCountryCode, getTaxPostalCode, shouldShowTax } from 'lib/cart-values';
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

	state = { processorCountry: 'US' };

	constructor() {
		super();
		this.detectedPaymentMethod = detectWebPaymentMethod();
	}

	/**
	 * @return {object} A dictionary containing `default`, `disabled` and `text` keys.
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
			case REDIRECTING_FOR_AUTHORIZATION:
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
		const { cart } = this.props;

		const supportedPaymentMethods = [
			{
				supportedMethods: WEB_PAYMENT_APPLE_PAY_METHOD,
				data: {
					version: 2,
					merchantIdentifier: APPLE_PAY_MERCHANT_IDENTIFIER,
					merchantCapabilities: [ 'supports3DS', 'supportsCredit', 'supportsDebit' ],
					supportedNetworks: SUPPORTED_NETWORKS,
					countryCode: this.state.processorCountry,
				},
			},
		];

		const paymentDetails = this.getPaymentDetails( cart );

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
	};

	/**
	 * @return {PaymentRequest} A configured payment request object.
	 */
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

		const paymentDetails = this.getPaymentDetails( cart );

		return new PaymentRequest( supportedPaymentMethods, paymentDetails, PAYMENT_REQUEST_OPTIONS );
	};

	/**
	 * Returns line items to display on the payment sheet during purchase authorization.
	 *
	 * @param {object} cart The cart object.
	 * @return {object} A dictionary containing `displayItems` and `total` keys.
	 */
	getPaymentDetails = cart => {
		const { translate } = this.props;

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
	};

	/**
	 * @param {string} paymentMethod  Payment method.
	 * @param {DOMEvent} event        Button event.
	 */
	submit = ( paymentMethod, event ) => {
		event.persist();
		event.preventDefault();

		switch ( paymentMethod ) {
			case WEB_PAYMENT_APPLE_PAY_METHOD:
				{
					const is_renewal = cartItems.hasRenewalItem( this.props.cart );
					analytics.tracks.recordEvent( 'calypso_checkout_apple_pay_open_payment_sheet', {
						is_renewal,
					} );

					const paymentRequest = this.getPaymentRequestForApplePay();

					try {
						paymentRequest
							.show()
							.then( paymentResponse => {
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
									country: getTaxCountryCode( this.props.cart ),
									'postal-code': getTaxPostalCode( this.props.cart ),
									card_brand: token.paymentMethod.network,
									card_display_name: token.paymentMethod.displayName,
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
	 * @param {string} errorMessage  Error message.
	 * @param {DOMEvent} event       Button event.
	 */
	displaySubmissionError = ( errorMessage, event ) => {
		event.preventDefault();
		notices.error( errorMessage );
	};

	/**
	 * @param {string} fieldName The name of the country select field.
	 * @param {string} selectedCountryCode The selected country.
	 */
	updateSelectedCountry = ( fieldName, selectedCountryCode ) => {
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
				this.setState( { processorCountry } );
			}.bind( this )
		);
	};

	/**
	 * @param {object} event  Event object.
	 */
	updateSelectedPostalCode = event => {
		const { name: key, value } = event.target;

		if ( 'postal-code' === key ) {
			setTaxPostalCode( value );
		}
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const paymentMethod = this.detectedPaymentMethod;
		const { cart, countriesList, presaleChatAvailable, translate } = this.props;
		const countryCode = getTaxCountryCode( cart );
		const postalCode = getTaxPostalCode( cart );

		if ( ! paymentMethod ) {
			return null;
		}

		const hasBusinessPlanInCart = some( cart.products, ( { product_slug } ) =>
			overSome( isWpComBusinessPlan, isWpComEcommercePlan )( product_slug )
		);
		const showPaymentChatButton = presaleChatAvailable && hasBusinessPlanInCart;

		const buttonState = this.getButtonState();
		const buttonDisabled = buttonState.disabled;
		let button;
		let paymentType;

		switch ( paymentMethod ) {
			case WEB_PAYMENT_APPLE_PAY_METHOD:
				if ( buttonState.default ) {
					button = (
						<button
							type="submit"
							onClick={ event =>
								! countryCode || ! postalCode
									? this.displaySubmissionError(
											translate( 'Please specify a country and postal code.' ),
											event
									  )
									: this.submit( paymentMethod, event )
							}
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
				paymentType = 'apple-pay';
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
				paymentType = 'web-payment';
				break;

			default:
				debug( `Unknown payment method ${ paymentMethod }.` );
		}

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
								onCountrySelected={ this.updateSelectedCountry }
								value={ countryCode }
								eventFormName="Checkout Form"
							/>
							<Input
								additionalClasses="checkout-field"
								name="postal-code"
								label={ translate( 'Postal Code', { textOnly: true } ) }
								onChange={ this.updateSelectedPostalCode }
								value={ postalCode }
								eventFormName="Checkout Form"
							/>
						</div>
					</div>

					{ this.props.children }

					<RecentRenewals cart={ cart } />

					<CheckoutTerms cart={ cart } />

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
}

export default localize( WebPaymentBox );
