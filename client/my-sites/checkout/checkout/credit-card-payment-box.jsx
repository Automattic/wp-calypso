/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { some } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import CreditCardSelector from './credit-card-selector';
import TermsOfService from './terms-of-service';
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
	constructor( props ) {
		super( props );
		this.state = {
			progress: 0,
			previousCart: null,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if (
			! this.submitting( this.props.transactionStep ) &&
			this.submitting( nextProps.transactionStep )
		) {
			this.timer = setInterval( this.tick, 100 );
		} else {
			this.clearTickInterval();
		}
	}

	componentWillUnmount() {
		this.clearTickInterval();
	}

	clearTickInterval() {
		clearInterval( this.timer );
	}

	tick = () => {
		const progress = this.state.progress + 1 / 200 * ( 100 - this.state.progress );
		this.setState( { progress } );
	};

	submitting = transactionStep => {
		switch ( transactionStep.name ) {
			case BEFORE_SUBMIT:
				return false;

			case INPUT_VALIDATION:
				if ( transactionStep.error ) {
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

	progressBar = () => {
		return (
			<div className="checkout__credit-card-payment-box-progress-bar">
				{ this.props.translate( 'Processing payment…' ) }
				<ProgressBar value={ Math.round( this.state.progress ) } isPulsing />
			</div>
		);
	};

	paymentButtons = () => {
		const cart = this.props.cart,
			hasBusinessPlanInCart = some( cart.products, { product_slug: PLAN_BUSINESS } ),
			showPaymentChatButton =
				config.isEnabled( 'upgrades/presale-chat' ) &&
				abtest( 'presaleChatButton' ) === 'showChatButton' &&
				hasBusinessPlanInCart,
			paymentButtonClasses = 'payment-box__payment-buttons';

		return (
			<div className={ paymentButtonClasses }>
				<PayButton cart={ this.props.cart } transactionStep={ this.props.transactionStep } />

				<div className="checkout__secure-payment">
					<div className="checkout__secure-payment-content">
						<Gridicon icon="lock" />
						{ this.props.translate( 'Secure Payment' ) }
					</div>
				</div>

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
		return <div className="checkout__payment-box-actions">{ content }</div>;
	};

	submit = event => {
		event.preventDefault();
		this.setState( {
			progress: 0,
		} );
		this.props.onSubmit( event );
	};

	render = () => {
		const cart = this.props.cart;

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
