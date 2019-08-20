/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isPaidForFullyInCredits } from 'lib/cart-values';
import { hasOnlyFreeTrial, hasRenewalItem, hasFreeTrial } from 'lib/cart-values/cart-items';
import Button from 'components/button';
import SubscriptionText from 'my-sites/checkout/checkout/subscription-text';
import {
	BEFORE_SUBMIT,
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	RECEIVED_AUTHORIZATION_RESPONSE,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
	REDIRECTING_FOR_AUTHORIZATION,
	MODAL_AUTHORIZATION,
} from 'lib/store-transactions/step-types';
import { abtest } from 'lib/abtest';

export class PayButton extends React.Component {
	buttonState = () => {
		if ( this.isRecalculatingCart() ) {
			return this.recalculating();
		}

		let state;

		switch ( this.props.transactionStep.name ) {
			case BEFORE_SUBMIT:
				state = this.beforeSubmit();
				break;

			case INPUT_VALIDATION:
				if ( this.props.transactionStep.error ) {
					state = this.beforeSubmit();
				} else {
					state = this.sending();
				}
				break;

			case SUBMITTING_PAYMENT_KEY_REQUEST:
				state = this.sending();
				break;

			case REDIRECTING_FOR_AUTHORIZATION:
			case RECEIVED_PAYMENT_KEY_RESPONSE:
				if ( this.props.transactionStep.error ) {
					state = this.beforeSubmit();
				} else {
					state = this.sending();
				}
				break;

			case SUBMITTING_WPCOM_REQUEST:
			case MODAL_AUTHORIZATION:
				state = this.completing();
				break;

			case RECEIVED_AUTHORIZATION_RESPONSE:
			case RECEIVED_WPCOM_RESPONSE:
				if ( this.props.transactionStep.error || ! this.props.transactionStep.data.success ) {
					state = this.beforeSubmit();
				} else {
					state = this.completing();
				}
				break;

			default:
				throw new Error( 'Unknown transaction step: ' + this.props.transactionStep.name );
		}

		return state;
	};

	beforeSubmitText = () => {
		const cart = this.props.cart;

		if ( this.props.beforeSubmitText ) {
			return this.props.beforeSubmitText;
		}

		if ( hasOnlyFreeTrial( cart ) ) {
			return this.props.translate( 'Start %(days)s Day Free Trial', {
				args: { days: '14' },
				context: 'Pay button for free trials on /checkout',
			} );
		}

		if ( cart.total_cost_display ) {
			if ( isPaidForFullyInCredits( cart ) ) {
				if ( hasRenewalItem( this.props.cart ) ) {
					return this.props.translate( 'Purchase %(price)s subscription with Credits', {
						args: { price: cart.total_cost_display },
						context: 'Renew button on /checkout',
					} );
				}

				return this.props.translate( 'Pay %(price)s with Credits', {
					args: { price: cart.total_cost_display },
					context: 'Pay button on /checkout',
				} );
			}

			if ( hasRenewalItem( this.props.cart ) ) {
				return this.props.translate( 'Renew subscription - %(price)s', {
					args: { price: cart.total_cost_display },
					context: 'Renew button on /checkout',
				} );
			}

			return this.props.translate( 'Pay %(price)s', {
				args: { price: cart.total_cost_display },
				context: 'Pay button on /checkout',
			} );
		}

		return this.props.translate( 'Pay now', { context: 'Pay button on /checkout' } );
	};
	beforeSubmitTextVariant = () => {
		const cart = this.props.cart;

		if ( this.props.beforeSubmitTextVariant ) {
			return this.props.beforeSubmitTextVariant;
		}

		if ( hasOnlyFreeTrial( cart ) ) {
			return this.props.translate( 'Start %(days)s Day Free Trial', {
				args: { days: '14' },
				context: 'Pay button for free trials on /checkout',
			} );
		}

		if ( cart.total_cost_display ) {
			if ( isPaidForFullyInCredits( cart ) ) {
				if ( hasRenewalItem( this.props.cart ) ) {
					return this.props.translate( 'Complete subscription purchase with Credits', {
						context: 'Renew button on /checkout',
					} );
				}

				return this.props.translate( 'Complete purchase with Credits', {
					context: 'Pay button on /checkout',
				} );
			}

			if ( hasRenewalItem( this.props.cart ) ) {
				return this.props.translate( 'Renew subscription now', {
					context: 'Renew button on /checkout',
				} );
			}

			return this.props.translate( 'Complete purchase', {
				context: 'Pay button on /checkout',
			} );
		}

		return this.props.translate( 'Complete purchase', { context: 'Pay button on /checkout' } );
	};

	beforeSubmit = () => {
		return {
			disabled: false,
			text:
				'variant' === abtest( 'checkoutSealsCopyBundle' )
					? this.beforeSubmitTextVariant()
					: this.beforeSubmitText(),
		};
	};

	recalculating = () => {
		return {
			disabled: true,
			text: this.props.translate( 'Calculating price' ),
		};
	};

	sending = () => {
		return {
			disabled: true,
			text: this.props.translate( 'Sending your purchase', {
				context: 'Loading state on /checkout',
			} ),
		};
	};

	completing = () => {
		let text;
		if ( hasFreeTrial( this.props.cart ) ) {
			text = this.props.translate( 'Starting your free trial…', {
				context: 'Loading state on /checkout',
			} );
		} else {
			text = this.props.translate( 'Completing your purchase', {
				context: 'Loading state on /checkout',
			} );
		}
		return {
			disabled: true,
			text: text,
		};
	};

	isRecalculatingCart() {
		return this.props.cart.hasPendingServerUpdates;
	}

	render() {
		const buttonState = this.buttonState();

		return (
			<span className="checkout__pay-button pay-button">
				<Button
					type="submit"
					className="checkout__pay-button-button button is-primary button-pay pay-button__button"
					busy={ buttonState.disabled }
					disabled={ buttonState.disabled }
				>
					{ buttonState.text }
				</Button>
				<SubscriptionText cart={ this.props.cart } />
			</span>
		);
	}
}

export default localize( PayButton );
