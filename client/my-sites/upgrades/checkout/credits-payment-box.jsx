/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var PayButton = require( './pay-button' ),
	PaymentBox = require( './payment-box' ),
	TermsOfService = require( './terms-of-service' );

var CreditsPaymentBox = React.createClass( {
	content: function() {
		var cart = this.props.cart;

		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<h6>{ this.translate( 'WordPress.com Credits' ) }</h6>

					<span>
						{ this.translate( 'You have {{strong}}%(credits)s %(currency)s in Credits{{/strong}} available.',
							{
								args: {
									credits: cart.credits,
									currency: cart.currency
								},
								components: {
									strong: <strong />
								}
							} )
						}
					</span>
				</div>

				<TermsOfService />
				<div className="payment-box-actions">
					<PayButton
						cart={ this.props.cart }
						transactionStep={ this.props.transactionStep } />
				</div>
			</form>
		);
	},

	render: function() {
		var classSet = classNames( {
			'credits-payment-box': true,
			selected: this.props.selected === true
		} );

		return (
			<PaymentBox
				classSet={ classSet }
				title={ this.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}
} );

module.exports = CreditsPaymentBox;
