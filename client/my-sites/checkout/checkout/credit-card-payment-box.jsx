/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import classnames from 'classnames';
import { some } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import CreditCardSelector from './credit-card-selector';
import TermsOfService from './terms-of-service';
import analytics from 'lib/analytics';
import cartValues from 'lib/cart-values';
import {
	BEFORE_SUBMIT,
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import { abtest } from 'lib/abtest';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import config from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import ProgressBar from 'components/progress-bar';
import CartToggle from './cart-toggle';

class CreditCardPaymentBox extends React.Component {
	state = {
		progress: 0,
		previousCart: null,
	};

	componentWillReceiveProps( nextProps ) {
		if (
			! this.submitting( this.props.transactionStep ) &&
			this.submitting( nextProps.transactionStep )
		) {
			this.timer = setInterval( this.tick, 100 );
		}
	}

	componentWillUnmount() {
		clearInterval( this.timer );
	}

	tick = () => {
		// increase the progress of the progress bar by 0.5% of the remaining progress each tick
		const progress = this.state.progress + 1 / 200 * ( 100 - this.state.progress );

		this.setState( { progress } );
	};

	submitting = transactionStep => {
		switch ( transactionStep.name ) {
			case BEFORE_SUBMIT:
				return false;

			case INPUT_VALIDATION:
				if ( this.props.transactionStep.error ) {
					return false;
				}
				return true;

			case SUBMITTING_PAYMENT_KEY_REQUEST:
			case RECEIVED_PAYMENT_KEY_RESPONSE:
			case SUBMITTING_WPCOM_REQUEST:
				return true;

			case RECEIVED_WPCOM_RESPONSE:
				if ( transactionStep.error || ! transactionStep.data.success ) {
					return false;
				}
				return true;

			default:
				return false;
		}
	};

	handleToggle = event => {
		event.preventDefault();

		analytics.ga.recordEvent( 'Upgrades', 'Clicked Or Use Paypal Link' );
		analytics.tracks.recordEvent( 'calypso_checkout_switch_to_paypal' );
		this.props.onToggle( 'paypal' );
	};

	progressBar = () => {
		return (
			<div className="credit-card-payment-box__progress-bar">
				{ this.props.translate( 'Processing payment…' ) }
				<ProgressBar value={ Math.round( this.state.progress ) } isPulsing />
			</div>
		);
	};

	renderSecurePaymentNotice = () => {
		if ( abtest( 'checkoutPaymentMethodTabs' ) === 'tabs' ) {
			return (
				<div className="checkout__secure-payment">
					<div className="checkout__secure-payment-content">
						<Gridicon icon="lock" />
						{ this.props.translate( 'Secure Payment' ) }
					</div>
				</div>
			);
		}

		return null;
	};

	paymentButtons = () => {
		const cart = this.props.cart,
			hasBusinessPlanInCart = some( cart.products, { product_slug: PLAN_BUSINESS } ),
			showPaymentChatButton =
				config.isEnabled( 'upgrades/presale-chat' ) &&
				abtest( 'presaleChatButton' ) === 'showChatButton' &&
				hasBusinessPlanInCart,
			paypalButtonClasses = classnames( 'credit-card-payment-box__switch-link', {
				'credit-card-payment-box__switch-link-left': showPaymentChatButton,
			} ),
			paymentButtonsClasses = classnames( 'payment-box__payment-buttons', {
				'payment-box__payment-buttons-test': abtest( 'checkoutPaymentMethodTabs' ) === 'tabs',
			} );

		return (
			<div className={ paymentButtonsClasses }>
				<PayButton cart={ this.props.cart } transactionStep={ this.props.transactionStep } />

				{ this.renderSecurePaymentNotice() }

				{ this.props.onToggle && cartValues.isPayPalExpressEnabled( cart ) ? (
					<a className={ paypalButtonClasses } href="" onClick={ this.handleToggle }>
						{ this.props.translate( 'or use {{paypal/}}', {
							components: {
								paypal: <img src="/calypso/images/upgrades/paypal.svg" alt="PayPal" width="80" />,
							},
						} ) }
					</a>
				) : null }

				<CartCoupon cart={ cart } />

				<CartToggle />

				{ showPaymentChatButton && (
					<PaymentChatButton
						paymentType="credits"
						cart={ this.props.cart }
						transactionStep={ this.props.transactionStep }
					/>
				) }
			</div>
		);
	};

	paymentBoxActions = () => {
		let content = this.paymentButtons();
		if ( this.props.transactionStep && this.submitting( this.props.transactionStep ) ) {
			content = this.progressBar();
		}

		return <div className="payment-box-actions">{ content }</div>;
	};

	submit = event => {
		event.preventDefault();
		this.setState( {
			progress: 0,
		} );
		this.props.onSubmit( event );
	};

	render = () => {
		var cart = this.props.cart;

		return (
			<form autoComplete="off" onSubmit={ this.submit }>
				<CreditCardSelector
					cards={ this.props.cards }
					countriesList={ this.props.countriesList }
					initialCard={ this.props.initialCard }
					transaction={ this.props.transaction }
				/>

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( cart ) }
				/>

				{ this.paymentBoxActions() }
			</form>
		);
	};
}

export default localize( CreditCardPaymentBox );
