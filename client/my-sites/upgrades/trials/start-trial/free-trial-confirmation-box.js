
/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	find = require( 'lodash/collection/find' );

/**
 * Internal dependencies
 */
var isPlan = require( 'lib/products-values' ).isPlan,
	PayButton = require( 'my-sites/upgrades/checkout/pay-button' ),
	PaymentBox = require( 'my-sites/upgrades/checkout/payment-box' ),
	TermsOfService = require( './terms-of-service.jsx');

const FreeTrialConfirmationBox = React.createClass( {
	content() {
		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
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
				<div className="payment-box-actions">
					<PayButton
						beforeSubmitText={
							this.translate( 'Start %(days)s Day Free Trial', {
								args: { days: '14' },
								context: 'Pay button for free trials on /checkout'
							} )
						}
						completingText={
							this.translate( 'Starting your free trial…', { context: 'Loading state on /start-trial' } )
						}
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

FreeTrialConfirmationBox.Placeholder = React.createClass( {
	displayName: 'FreeTrialConfirmationBox.Placeholder',

	render: function() {
		return (
			<PaymentBox
				classSet="selected is-empty"
				contentClassSet="selected is-empty" >
				<div className="payment-box-section">
					<div className="placeholder-row placeholder"/>

					<div className="placeholder-col-narrow placeholder-inline-pad">
						<div className="placeholder" />
					</div>
				</div>

				<TermsOfService />
				<div className="payment-box-actions">
					<div className="placeholder-button-container">
						<div className="placeholder-col-narrow">
							<div className="placeholder placeholder-button"></div>
						</div>
					</div>
				</div>
			</PaymentBox>
		);
	}
} );

module.exports = FreeTrialConfirmationBox;
