/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var cartValues = require( 'lib/cart-values' ),
	cartItems = cartValues.cartItems,
	isPaidForFullyInCredits = cartValues.isPaidForFullyInCredits,
	SubscriptionText = require( './subscription-text' );

var PayButton = React.createClass( {
	buttonState: function() {
		var state;

		switch ( this.props.transactionStep.name ) {
			case 'before-submit':
				state = this.beforeSubmit();
				break;

			case 'input-validation':
				if ( this.props.transactionStep.error ) {
					state = this.beforeSubmit();
				} else {
					state = this.sending();
				}
				break;

			case 'submitting-payment-key-request':
			case 'received-payment-key-response':
				state = this.sending();
				break;

			case 'submitting-wpcom-request':
				state = this.completing();
				break;

			case 'received-wpcom-response':
				if ( this.props.transactionStep.error || ! this.props.transactionStep.data.success ) {
					state = this.beforeSubmit();
				} else {
					state = this.completed();
				}
				break;

			default:
				throw new Error( 'Unknown transaction step: ' + this.props.transactionStep.name );
		}

		return state;
	},

	beforeSubmitText: function() {
		var cart = this.props.cart;

		if ( this.props.beforeSubmitText ) {
			return this.props.beforeSubmitText;
		}

		if ( cart.total_cost_display ) {
			if ( isPaidForFullyInCredits( cart ) ) {
				if ( cartItems.hasRenewalItem( this.props.cart ) ) {
					return this.translate( 'Purchase %(price)s subscription with Credits', {
						args: { price: cart.total_cost_display },
						context: 'Renew button on /checkout'
					} );
				}

				return this.translate( 'Pay %(price)s with Credits', {
					args: { price: cart.total_cost_display },
					context: 'Pay button on /checkout'
				} );
			}

			if ( cartItems.hasRenewalItem( this.props.cart ) ) {
				return this.translate( 'Purchase %(price)s subscription', {
					args: { price: cart.total_cost_display },
					context: 'Renew button on /checkout'
				} );
			}

			return this.translate( 'Pay %(price)s', {
				args: { price: cart.total_cost_display },
				context: 'Pay button on /checkout'
			} );
		}

		return this.translate( 'Pay now', { context: 'Pay button on /checkout' } );
	},

	beforeSubmit: function() {
		return {
			disabled: false,
			text: this.beforeSubmitText()
		};
	},

	sending: function() {
		return {
			disabled: true,
			text: this.translate( 'Sending your purchase', { context: 'Loading state on /checkout' } )
		};
	},

	completing: function() {
		if ( this.props.completingText ) {
			return {
				disabled: true,
				text: this.props.completingText
			};
		}

		return {
			disabled: true,
			text: this.translate( 'Completing your purchase', { context: 'Loading state on /checkout' } )
		};
	},

	completed: function() {
		return {
			disabled: true,
			text: this.translate( 'Purchase complete', { context: 'Loading state on /checkout' } )
		};
	},

	render: function() {
		var buttonState = this.buttonState();

		return (
			<span className="pay-button">
				<button type="submit" className="button is-primary button-pay pay-button__button" disabled={ buttonState.disabled }>
					{ buttonState.text }
				</button>
				<SubscriptionText cart={ this.props.cart } />
			</span>
		);
	}
} );

module.exports = PayButton;
