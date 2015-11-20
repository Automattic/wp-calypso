/**
 * External dependencies
 */
var React = require( 'react' ),
	isFunction = require( 'lodash/lang/isFunction' ),
	page = require( 'page' );

/** Internal dependencies **/
var AnalyticsMixin = require( 'lib/mixins/analytics' );

var CartButtons = React.createClass( {
	mixins: [ AnalyticsMixin( 'popupCart' ) ],

	propTypes: {
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getDefaultProps: function() {
		return { showKeepSearching: false };
	},

	render: function() {
		return (
			<div className="cart-buttons">
				<button ref="checkoutButton" className="cart-checkout-button button is-primary"
						onClick={ this.goToCheckout }>
					{ this.translate( 'Checkout', { context: 'Cart button' } ) }
				</button>

				{ this.optionalKeepSearching() }
			</div>
		);
	},

	optionalKeepSearching: function() {
		if ( ! this.props.showKeepSearching ) {
			return;
		}

		return (
			<button ref="keepSearchingButton" className="cart-keep-searching-button button"
					onClick={ this.onKeepSearchingClick }>
				{ this.translate( 'Keep Searching' ) }
			</button>
		);
	},

	onKeepSearchingClick: function( event ) {
		event.preventDefault();
		this.recordEvent( 'keepSearchButtonClick' );
		if ( isFunction( this.props.onKeepSearchingClick ) ) {
			this.props.onKeepSearchingClick( event );
		}
	},

	goToCheckout: function( event ) {
		event.preventDefault();

		this.recordEvent( 'checkoutButtonClick' );

		page( '/checkout/' + this.props.selectedSite.slug );
	}
} );

module.exports = CartButtons;
