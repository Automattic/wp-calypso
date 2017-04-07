/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
var PayButton = require( './pay-button' ),
	CreditCardSelector = require( './credit-card-selector' ),
	TermsOfService = require( './terms-of-service' ),
	PaymentBox = require( './payment-box' ),
	analytics = require( 'lib/analytics' ),
	cartValues = require( 'lib/cart-values' ),
	transactionStepTypes = require( 'lib/store-transactions/step-types' );

import { abtest } from 'lib/abtest';
import CartCoupon from 'my-sites/upgrades/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import config from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import ProgressBar from 'components/progress-bar';

var CreditCardPaymentBox = React.createClass( {
	getInitialState: function() {
		return {
			progress: 0,
			previousCart: null
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.submitting( this.props.transactionStep ) && this.submitting( nextProps.transactionStep ) ) {
			this.timer = setInterval( this.tick, 100 );
		}
	},

	componentWillUnmount: function() {
		clearInterval( this.timer );
	},

	tick: function() {
		// increase the progress of the progress bar by 0.5% of the remaining progress each tick
		const progress = this.state.progress + 1 / 200 * ( 100 - this.state.progress );

		this.setState( { progress } );
	},

	submitting: function( transactionStep ) {
		switch ( transactionStep.name ) {
			case transactionStepTypes.BEFORE_SUBMIT:
				return false;

			case transactionStepTypes.INPUT_VALIDATION:
				if ( this.props.transactionStep.error ) {
					return false;
				}
				return true;

			case transactionStepTypes.SUBMITTING_PAYMENT_KEY_REQUEST:
			case transactionStepTypes.RECEIVED_PAYMENT_KEY_RESPONSE:
			case transactionStepTypes.SUBMITTING_WPCOM_REQUEST:
				return true;

			case transactionStepTypes.RECEIVED_WPCOM_RESPONSE:
				if ( transactionStep.error || ! transactionStep.data.success ) {
					return false;
				}
				return true;

			default:
				return false;
		}
	},

	handleToggle: function( event ) {
		event.preventDefault();

		analytics.ga.recordEvent( 'Upgrades', 'Clicked Or Use Paypal Link' );
		analytics.tracks.recordEvent( 'calypso_checkout_switch_to_paypal' );
		this.props.onToggle( 'paypal' );
	},

	progressBar: function() {
		return (
			<div className="credit-card-payment-box__progress-bar">
				{ this.translate( 'Processing payment…' ) }
				<ProgressBar value={ Math.round( this.state.progress ) } isPulsing />
			</div>
		);
	},

	paymentButtons: function() {
		const cart = this.props.cart,
			hasBusinessPlanInCart = some( cart.products, { product_slug: PLAN_BUSINESS } ),
			showPaymentChatButton = config.isEnabled( 'upgrades/presale-chat' ) &&
				abtest( 'presaleChatButton' ) === 'showChatButton' &&
				hasBusinessPlanInCart,
			paypalButtonClasses = classnames( 'credit-card-payment-box__switch-link', {
				'credit-card-payment-box__switch-link-left': showPaymentChatButton
			} );

		return (
			<div className="payment-box__payment-buttons">
				<PayButton
					cart={ this.props.cart }
					transactionStep={ this.props.transactionStep } />

				{ cartValues.isPayPalExpressEnabled( cart )
					? <a className={ paypalButtonClasses } href="" onClick={ this.handleToggle }>{ this.translate( 'or use PayPal' ) }</a>
					: null
				}

				{
					showPaymentChatButton &&
					<PaymentChatButton
						paymentType="credits"
						cart={ this.props.cart }
						transactionStep={ this.props.transactionStep } />
				}
			</div>
		);
	},

	paymentBoxActions: function() {
		let content = this.paymentButtons();
		if ( this.props.transactionStep && this.submitting( this.props.transactionStep ) ) {
			content = this.progressBar();
		}

		return (
			<div className="payment-box-actions">
				{ content }
			</div>
		);
	},

	submit: function( event ) {
		event.preventDefault();
		this.setState( {
			progress: 0
		} );
		this.props.onSubmit( event );
	},

	content: function() {
		var cart = this.props.cart;

		return (
			<form autoComplete="off" onSubmit={ this.submit }>
				<CreditCardSelector
					cards={ this.props.cards }
					countriesList={ this.props.countriesList }
					initialCard={ this.props.initialCard }
					transaction={ this.props.transaction } />

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( cart ) } />

				<CartCoupon cart={ cart } />

				{ this.paymentBoxActions() }
			</form>
		);
	},

	render: function() {
		return (
			<PaymentBox
				classSet="credit-card-payment-box"
				title={ this.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}

} );

module.exports = CreditCardPaymentBox;
