/** @format */

/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import { assign, overSome, some } from 'lodash';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { getLocationOrigin, getTaxPostalCode } from 'lib/cart-values';
import { hasRenewalItem } from 'lib/cart-values/cart-items';
import { setTaxPostalCode } from 'lib/upgrades/actions/cart';
import Input from 'my-sites/domains/components/form/input';
import notices from 'notices';
import PaymentCountrySelect from 'components/payment-country-select';
import SubscriptionText from './subscription-text';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'lib/plans';
import CartToggle from './cart-toggle';
import wp from 'lib/wp';
import RecentRenewals from './recent-renewals';
import CheckoutTerms from './checkout-terms';

const wpcom = wp.undocumented();

export class PaypalPaymentBox extends React.Component {
	static displayName = 'PaypalPaymentBox';

	state = {
		country: null,
		formDisabled: false,
	};

	handlePostalCodeChange = event => {
		setTaxPostalCode( event.target.value );
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

	redirectToPayPal = event => {
		const { cart, transaction } = this.props;
		const origin = getLocationOrigin( window.location );
		event.preventDefault();

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

		const dataForApi = assign( {}, this.state, {
			successUrl: origin + this.props.redirectTo(),
			cancelUrl,
			cart,
			domainDetails: transaction.domainDetails,
			'postal-code': getTaxPostalCode( cart ),
		} );

		// get PayPal Express URL from rest endpoint
		wpcom.paypalExpressUrl(
			dataForApi,
			function( error, paypalExpressURL ) {
				let errorMessage;
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
		if ( hasRenewalItem( this.props.cart ) ) {
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
		const { cart } = this.props;
		const hasBusinessPlanInCart = some( cart.products, ( { product_slug } ) =>
			overSome( isWpComBusinessPlan, isWpComEcommercePlan )( product_slug )
		);
		const showPaymentChatButton = this.props.presaleChatAvailable && hasBusinessPlanInCart;

		return (
			<React.Fragment>
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
								value={ getTaxPostalCode( cart ) || '' }
								onChange={ this.handlePostalCodeChange }
								disabled={ this.state.formDisabled }
								eventFormName="Checkout Form"
							/>
						</div>
					</div>

					{ this.props.children }

					<RecentRenewals cart={ this.props.cart } />

					<CheckoutTerms cart={ cart } />

					<div className="checkout__payment-box-actions">
						<div className="checkout__payment-box-buttons">
							<span className="checkout__pay-button">
								<button
									type="submit"
									className="checkout__pay-button-button button is-primary"
									disabled={ this.state.formDisabled || cart.hasPendingServerUpdates }
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
						</div>
					</div>
				</form>
				<CartCoupon cart={ this.props.cart } />
				<CartToggle />
			</React.Fragment>
		);
	};
}

export default localize( PaypalPaymentBox );
