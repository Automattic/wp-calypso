
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

var FreeTrialConfirmationBox = React.createClass( {
	content: function() {
		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<h6>
					{
						this.translate( 'Get started with %(productName)s', { args: { productName: this.props.cart.products[0].product_name } } )
					}
					</h6>

					<span>
					{
						this.translate( 'Enjoy your free trial with no strings attached: your site will simply revert to the free plan when the period is over.' )
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
			<PaymentBox classSet={ classSet }>
				{ this.content() }
			</PaymentBox>
		);
	}
} );

module.exports = FreeTrialConfirmationBox;
