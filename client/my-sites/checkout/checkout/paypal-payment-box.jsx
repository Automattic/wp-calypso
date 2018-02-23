/** @format */

/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import { assign, some } from 'lodash';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import cartValues from 'lib/cart-values';
import Input from 'my-sites/domains/components/form/input';
import notices from 'notices';
import PaymentCountrySelect from 'components/payment-country-select';
import SubscriptionText from './subscription-text';
import TermsOfService from './terms-of-service';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import CartToggle from './cart-toggle';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

class PaypalPaymentBox extends React.Component {
	static displayName = 'PaypalPaymentBox';

	state = {
		country: null,
		formDisabled: false,
	};

	handleChange = event => {
		this.updateLocalStateWithFieldValue( event.target.name, event.target.value );
	};

	updateLocalStateWithFieldValue = ( fieldName, fieldValue ) => {
		const data = {};
		data[ fieldName ] = fieldValue;
		this.setState( data );
	};

	setSubmitState = submitState => {
		if ( submitState.error ) {
			notices.error( submitState.error );
		}
		if ( submitState.info ) {
			notices.info( submitState.info );
		}

		this.setState( {
			formDisabled: submitState.disabled,
		} );
	};

	getLocationOrigin = l => {
		return l.protocol + '//' + l.hostname + ( l.port ? ':' + l.port : '' );
	};

	redirectToPayPal = event => {
		var cart,
			transaction,
			dataForApi,
			origin = this.getLocationOrigin( window.location );
		event.preventDefault();

		cart = this.props.cart;
		transaction = this.props.transaction;

		this.setSubmitState( {
			info: this.props.translate( 'Sending details to PayPal' ),
			disabled: true,
		} );

		let cancelUrl = origin + '/checkout/';

		if ( this.props.selectedSite ) {
			cancelUrl += this.props.selectedSite.slug;
		} else {
			cancelUrl += 'no-site';
		}

		dataForApi = assign( {}, this.state, {
			successUrl: origin + this.props.redirectTo(),
			cancelUrl,
			cart,
			domainDetails: transaction.domainDetails,
		} );

		// get PayPal Express URL from rest endpoint
		wpcom.paypalExpressUrl(
			dataForApi,
			function( error, paypalExpressURL ) {
				var errorMessage;
				if ( error ) {
					if ( error.message ) {
						errorMessage = error.message;
					} else {
						errorMessage = this.props.translate( 'Please specify a country and postal code.' );
					}

					this.setSubmitState( {
						error: errorMessage,
						disabled: false,
					} );
				}

				if ( paypalExpressURL ) {
					this.setSubmitState( {
						info: this.props.translate( 'Redirecting you to PayPal' ),
						disabled: true,
					} );
					analytics.ga.recordEvent( 'Upgrades', 'Clicked Checkout With Paypal Button' );
					analytics.tracks.recordEvent( 'calypso_checkout_with_paypal' );
					window.location = paypalExpressURL;
				}
			}.bind( this )
		);
	};

	renderButtonText = () => {
		if ( cartValues.cartItems.hasRenewalItem( this.props.cart ) ) {
			return this.props.translate( 'Purchase %(price)s subscription with PayPal', {
				args: { price: this.props.cart.total_cost_display },
				context: 'Pay button on /checkout',
			} );
		}

		return this.props.translate( 'Pay %(price)s with PayPal', {
			args: { price: this.props.cart.total_cost_display },
			context: 'Pay button on /checkout',
		} );
	};

	render = () => {
		const hasBusinessPlanInCart = some( this.props.cart.products, {
			product_slug: PLAN_BUSINESS,
		} );
		const showPaymentChatButton = this.props.presaleChatAvailable && hasBusinessPlanInCart,
			paymentButtonClasses = 'payment-box__payment-buttons';

		return (
			<form onSubmit={ this.redirectToPayPal }>
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">
						<PaymentCountrySelect
							additionalClasses="checkout-field"
							name="country"
							label={ this.props.translate( 'Country', { textOnly: true } ) }
							countriesList={ this.props.countriesList }
							onCountrySelected={ this.updateLocalStateWithFieldValue }
							disabled={ this.state.formDisabled }
							eventFormName="Checkout Form"
						/>
						<Input
							additionalClasses="checkout-field"
							name="postal-code"
							label={ this.props.translate( 'Postal Code', { textOnly: true } ) }
							onChange={ this.handleChange }
							disabled={ this.state.formDisabled }
							eventFormName="Checkout Form"
						/>
					</div>
				</div>

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription(
						this.props.cart
					) }
				/>

				<div className="payment-box-actions">
					<div className={ paymentButtonClasses }>
						<span className="checkout__pay-button">
							<button
								type="submit"
								className="button is-primary button-pay checkout__button"
								disabled={ this.state.formDisabled }
							>
								{ this.renderButtonText() }
							</button>
							<SubscriptionText cart={ this.props.cart } />
						</span>

						<div className="checkout__secure-payment">
							<div className="checkout__secure-payment-content">
								<Gridicon icon="lock" />
								{ this.props.translate( 'Secure Payment' ) }
							</div>
						</div>

						{ showPaymentChatButton && (
							<PaymentChatButton paymentType="paypal" cart={ this.props.cart } />
						) }

						<CartCoupon cart={ this.props.cart } />

						<CartToggle />
					</div>
				</div>
			</form>
		);
	};
}

export default localize( PaypalPaymentBox );
