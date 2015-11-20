/**
 * External dependencies
 */
var React = require( 'react' );

var GoogleAppsProductDetails = React.createClass( {
	propTypes: {
		price: React.PropTypes.string.isRequired
	},

	render: function() {
		return (
			<div className="google-apps-dialog__product-details">
				<h3 className="google-apps-dialog__product-name">
					{ /* Intentionally not translable as it is a brand name and Google keeps it in English */ }
					<span className="google-apps-dialog__product-logo">Google </span>Apps for Work
				</h3>

				<h5 className="google-apps-dialog__file-storage">
					{ this.translate( '30GB Online File Storage' ) }
				</h5>

				<h5 className="google-apps-dialog__professional-email">
					{ this.translate( 'Professional Email Address' ) }
				</h5>

				<h4 className="google-apps-dialog__price-per-user">
					{ this.translate( '%(price)s per user / month ', { args: { price: this.props.price } } ) }
				</h4>

				<h5 className="google-apps-dialog__billing-period">
					{ this.translate( 'Billed yearly — get 2 months free!' ) }
				</h5>
			</div>
		);
	}
} );

module.exports = GoogleAppsProductDetails;
