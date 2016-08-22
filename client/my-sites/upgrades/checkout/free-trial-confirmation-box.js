
/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	find = require( 'lodash/find' );

/**
 * Internal dependencies
 */
var isPlan = require( 'lib/products-values' ).isPlan,
	PayButton = require( './pay-button' ),
	PaymentBox = require( './payment-box' ),
	TermsOfService = require( './terms-of-service' );

const FreeTrialConfirmationBox = React.createClass( {
	content() {
		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="checkout__payment-box-section">
					<h6>
					{
						this.translate( 'Get started with %(productName)s', { args: { productName: this.getProductName() } } )
					}
					</h6>

					<span>
					{
						this.translate( 'Enjoy your free trial with no strings attached: your site will simply revert to the free plan when the period is over.' )
					}
					</span>
				</div>

				<TermsOfService />
				<div className="checkout__payment-box-actions">
					<PayButton
						cart={ this.props.cart }
						transactionStep={ this.props.transactionStep } />
				</div>
			</form>
		);
	},

	getProductName() {
		const planProduct = find( this.props.cart.products, isPlan );

		return ( planProduct && planProduct.product_name ) || '';
	},

	render() {
		const classSet = classNames( {
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
