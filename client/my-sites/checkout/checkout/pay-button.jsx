/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var cartValues = require( 'lib/cart-values' ),
	cartItems = cartValues.cartItems,
	hasFreeTrial = cartItems.hasFreeTrial,
	isPaidForFullyInCredits = cartValues.isPaidForFullyInCredits,
	SubscriptionText = require( './subscription-text' ),
	transactionStepTypes = require( 'lib/store-transactions/step-types' );

class PayButton extends React.Component {
	buttonState = () => {
		var state;

		switch ( this.props.transactionStep.name ) {
			case transactionStepTypes.BEFORE_SUBMIT:
				state = this.beforeSubmit();
				break;

			case transactionStepTypes.INPUT_VALIDATION:
				if ( this.props.transactionStep.error ) {
					state = this.beforeSubmit();
				} else {
					state = this.sending();
				}
				break;

			case transactionStepTypes.SUBMITTING_PAYMENT_KEY_REQUEST:
			case transactionStepTypes.RECEIVED_PAYMENT_KEY_RESPONSE:
				state = this.sending();
				break;

			case transactionStepTypes.SUBMITTING_WPCOM_REQUEST:
				state = this.completing();
				break;

			case transactionStepTypes.RECEIVED_WPCOM_RESPONSE:
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
		var cart = this.props.cart;

		if ( this.props.beforeSubmitText ) {
			return this.props.beforeSubmitText;
		}

		if ( cartItems.hasOnlyFreeTrial( cart ) ) {
			return this.props.translate( 'Start %(days)s Day Free Trial', {
				args: { days: '14' },
				context: 'Pay button for free trials on /checkout',
			} );
		}

		if ( cart.total_cost_display ) {
			if ( isPaidForFullyInCredits( cart ) ) {
				if ( cartItems.hasRenewalItem( this.props.cart ) ) {
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

			if ( cartItems.hasRenewalItem( this.props.cart ) ) {
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

	beforeSubmit = () => {
		return {
			disabled: false,
			text: this.beforeSubmitText(),
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
		var text;
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

	render() {
		var buttonState = this.buttonState();

		return (
			<span className="pay-button">
				<button
					type="submit"
					className="button is-primary button-pay pay-button__button"
					disabled={ buttonState.disabled }
				>
					{ buttonState.text }
				</button>
				<SubscriptionText cart={ this.props.cart } />
			</span>
		);
	}
}

module.exports = localize( PayButton );
