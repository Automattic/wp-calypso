/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { assign, overSome, some } from 'lodash';
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { getLocationOrigin, getTaxPostalCode } from 'calypso/lib/cart-values';
import { hasRenewalItem } from 'calypso/lib/cart-values/cart-items';
import { setTaxPostalCode } from 'calypso/lib/cart/actions';
import Input from 'calypso/my-sites/domains/components/form/input';
import notices from 'calypso/notices';
import PaymentCountrySelect from 'calypso/components/payment-country-select';
import SubscriptionText from './subscription-text';
import CartCoupon from 'calypso/my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'calypso/lib/plans';
import CartToggle from './cart-toggle';
import wp from 'calypso/lib/wp';
import RecentRenewals from './recent-renewals';
import CheckoutTerms from './checkout-terms';
import IncompatibleProductMessage from './incompatible-product-message';

const wpcom = wp.undocumented();

const debug = debugFactory( 'calypso:paypal-payment-box' );

export class PaypalPaymentBox extends React.Component {
	static displayName = 'PaypalPaymentBox';

	state = {
		country: null,
		formDisabled: false,
	};

	handlePostalCodeChange = ( event ) => {
		setTaxPostalCode( event.target.value );
	};

	handleChange = ( event ) => {
		this.updateLocalStateWithFieldValue( event.target.name, event.target.value );
	};

	updateLocalStateWithFieldValue = ( fieldName, fieldValue ) => {
		const data = {};
		data[ fieldName ] = fieldValue;
		this.setState( data );
	};

	setSubmitState = ( submitState ) => {
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

	redirectToPayPal = ( event ) => {
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
		debug( 'submitting paypalExpress request', dataForApi );
		wpcom.paypalExpressUrl(
			dataForApi,
			function ( error, paypalExpressURL ) {
				debug( 'paypalExpress request complete' );
				if ( error ) {
					debug( 'paypalExpress request had an error', error );
					const errorMessage =
						error.message || this.props.translate( 'Please specify a country and postal code' );
					this.setSubmitState( {
						error: errorMessage,
						disabled: false,
					} );
					return;
				}

				if ( ! paypalExpressURL ) {
					debug( 'paypalExpress request returned no url' );
					const errorMessage = this.props.translate(
						'An error occurred connecting to PayPal; please check your information and try again'
					);
					this.setSubmitState( {
						error: errorMessage,
						disabled: false,
					} );
					return;
				}

				debug( 'paypalExpress request successfully got a url', paypalExpressURL );
				this.setSubmitState( {
					info: this.props.translate( 'Redirecting you to PayPal' ),
					disabled: true,
				} );
				gaRecordEvent( 'Upgrades', 'Clicked Checkout With Paypal Button' );
				recordTracksEvent( 'calypso_checkout_with_paypal' );
				window.location = paypalExpressURL;
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
		const { cart, incompatibleProducts, translate } = this.props;
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
								label={ translate( 'Country', { textOnly: true } ) }
								countriesList={ this.props.countriesList }
								onCountrySelected={ this.updateLocalStateWithFieldValue }
								disabled={ this.state.formDisabled }
								eventFormName="Checkout Form"
							/>
							<Input
								additionalClasses="checkout-field"
								name="postal-code"
								label={ translate( 'Postal Code', { textOnly: true } ) }
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
									disabled={
										this.state.formDisabled ||
										cart.hasPendingServerUpdates ||
										incompatibleProducts?.blockCheckout
									}
								>
									{ this.renderButtonText() }
								</button>
								<SubscriptionText cart={ this.props.cart } />
							</span>

							<div className="checkout__secure-payment">
								<div className="checkout__secure-payment-content">
									<Gridicon icon="lock" />
									{ translate( 'Secure payment' ) }
								</div>
							</div>

							{ showPaymentChatButton && (
								<PaymentChatButton paymentType="paypal" cart={ this.props.cart } />
							) }
						</div>
						<IncompatibleProductMessage incompatibleProducts={ incompatibleProducts } />
					</div>
				</form>
				<CartCoupon cart={ this.props.cart } />
				<CartToggle />
			</React.Fragment>
		);
	};
}

export default localize( PaypalPaymentBox );
