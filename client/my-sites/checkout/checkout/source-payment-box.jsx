/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { assign, some, map } from 'lodash';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import { abtest } from 'lib/abtest';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import config from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import CartToggle from './cart-toggle';
import TermsOfService from './terms-of-service';
import Input from 'my-sites/domains/components/form/input';
import cartValues from 'lib/cart-values';
import SubscriptionText from './subscription-text';
import analytics from 'lib/analytics';
import wpcom from 'lib/wp';
import notices from 'notices';
import FormSelect from 'components/forms/form-select';
import FormLabel from 'components/forms/form-label';

class SourcePaymentBox extends PureComponent {
	static propTypes = {
		paymentType: PropTypes.string.isRequired,
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		redirectTo: PropTypes.func.isRequired,
	}

	constructor() {
		super();
		this.redirectToPayment = this.redirectToPayment.bind( this );
		this.handleChange = this.handleChange.bind( this );
	}

	getLocationOrigin( l ) {
		return l.protocol + '//' + l.hostname + ( l.port ? ':' + l.port : '' );
	}

	handleChange( event ) {
		const data = {};
		data[ event.target.name ] = event.target.value;

		this.setState( data );
	}

	setSubmitState( submitState ) {
		if ( submitState.error ) {
			notices.error( submitState.error );
		}
		if ( submitState.info ) {
			notices.info( submitState.info );
		}

		this.setState( {
			formDisabled: submitState.disabled
		} );
	}

	paymentMethodByType( paymentType ) {
		if ( paymentType === 'ideal' ) {
			return 'WPCOM_Billing_Stripe_Source_Ideal';
		} else if ( paymentType === 'giropay' ) {
			return 'WPCOM_Billing_Stripe_Source_Giropay';
		} else if ( paymentType === 'bancontact' ) {
			return 'WPCOM_Billing_Stripe_Source_Bancontact';
		}
		return 'WPCOM_Billing_Stripe_Source';
	}

	redirectToPayment( event ) {
		const origin = this.getLocationOrigin( location );
		event.preventDefault();

		this.setSubmitState( {
			info: translate( 'Setting up your %(paymentProvider)s payment', {
				args: { paymentProvider: this.getPaymentProviderName() } } ),
			disabled: true
		} );

		let cancelUrl = origin + '/checkout/';

		if ( this.props.selectedSite ) {
			cancelUrl += this.props.selectedSite.slug;
		} else {
			cancelUrl += 'no-site';
		}

		const dataForApi = {
			payment: assign( {}, this.state, {
				paymentMethod: this.paymentMethodByType( this.props.paymentType ),
				successUrl: origin + this.props.redirectTo(),
				cancelUrl,
			} ),
			cart: this.props.cart,
			domainDetails: this.props.transaction.domainDetails
		};

		// get the redirect URL from rest endpoint
		wpcom.undocumented().transactions( 'POST', dataForApi, function( error, result ) {
			let errorMessage;
			if ( error ) {
				if ( error.message ) {
					errorMessage = error.message;
				} else {
					errorMessage = translate( "We've encountered a problem. Please try again later." );
				}

				this.setSubmitState( {
					error: errorMessage,
					disabled: false
				} );
			} else if ( result.redirect_url ) {
				this.setSubmitState( {
					info: translate( 'Redirecting you to your bank to complete the payment.' ),
					disabled: true
				} );
				analytics.ga.recordEvent( 'Upgrades', 'Clicked Checkout With Source Payment Button' );
				analytics.tracks.recordEvent( 'calypso_checkout_with_source_' + this.props.paymentType );
				location.href = result.redirect_url;
			}
		}.bind( this ) );
	}

	renderButtonText() {
		if ( cartValues.cartItems.hasRenewalItem( this.props.cart ) ) {
			return translate( 'Purchase %(price)s subscription with %(paymentProvider)s', {
				args: { price: this.props.cart.total_cost_display, paymentProvider: this.getPaymentProviderName() }
			} );
		}

		return translate( 'Pay %(price)s with %(paymentProvider)s', {
			args: { price: this.props.cart.total_cost_display, paymentProvider: this.getPaymentProviderName() }
		} );
	}

	renderBankOptions() {
		// Source https://stripe.com/docs/sources/ideal
		const idealBanks = {
			abn_amro: 'ABN AMRO',
			asn_bank: 'ASN Bank',
			bunq: 'Bunq',
			ing: 'ING',
			knab: 'Knab',
			rabobank: 'Rabobank',
			regiobank: 'RegioBank',
			sns_bank: 'SNS Bank',
			triodos_bank: 'Triodos Bank',
			van_lanschot: 'Van Lanschot',
		};

		const idealBanksOptions = map( idealBanks, ( text, optionValue ) => (
			<option value={ optionValue } key={ optionValue }>{ text }</option>
		) );

		return [
			<option value="" key="-">{ translate( 'Please select your bank.' ) }</option>,
			...idealBanksOptions
		];
	}

	renderAdditionalFields() {
		if ( 'ideal' === this.props.paymentType ) {
			return (
				<div className="checkout__checkout-field">
					<FormLabel htmlFor="ideal-bank">
						{ translate( 'Bank' ) }
					</FormLabel>
					<FormSelect
						name="ideal-bank"
						onChange={ this.handleChange }
					>
						{ this.renderBankOptions() }
					</FormSelect>
				</div>
			);
		}
	}

	render() {
		const hasBusinessPlanInCart = some( this.props.cart.products, { product_slug: PLAN_BUSINESS } );
		const showPaymentChatButton =
			config.isEnabled( 'upgrades/presale-chat' ) &&
			abtest( 'presaleChatButton' ) === 'showChatButton' &&
			hasBusinessPlanInCart;

		return (
			<form onSubmit={ this.redirectToPayment }>

				<div className="checkout__payment-box-section">
					<Input
						additionalClasses="checkout-field"
						name="name"
						onChange={ this.handleChange }
						label={ translate( 'Your Name' ) }
						eventFormName="Checkout Form" />

					{ this.renderAdditionalFields() }
				</div>

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( this.props.cart ) } />

				<div className="checkout__payment-box-actions">
					<div className="checkout__pay-button">
						<button type="submit" className="checkout__button-pay button is-primary " >
							{ this.renderButtonText() }
						</button>
						<SubscriptionText cart={ this.props.cart } />
					</div>

					{
						showPaymentChatButton &&
						<PaymentChatButton
							paymentType={ this.props.paymentType }
							cart={ this.props.cart } />
					}
				</div>

				<CartCoupon cart={ this.props.cart } />

				<CartToggle />
			</form>
		);
	}

	getPaymentProviderName() {
		switch ( this.props.paymentType ) {
			case 'ideal':
				return 'iDEAL';
			case 'giropay':
				return 'Giropay';
			case 'bancontact':
				return 'Bancontact';
		}

		return this.props.paymentType;
	}
}
SourcePaymentBox.displayName = 'SourcePaymentBox';

export default localize( SourcePaymentBox );
