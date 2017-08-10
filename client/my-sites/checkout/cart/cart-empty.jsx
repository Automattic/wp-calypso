/**
 * External dependencies
 */
import { startsWith } from 'lodash';

var React = require( 'react' ),
	page = require( 'page' );

var CartEmpty = React.createClass({
	render: function() {
		return (
			<div>
				<div className="cart-empty">
					{ this.translate( 'There are no items in your cart.' ) }
				</div>
				<div className="cart-buttons">
					<button className="cart-checkout-button button is-primary"
							onClick={ this.handleClick }>
							{ this.shouldShowPlanButton() ? this.translate( 'Add a Plan' ) : this.translate( 'Add a Domain' ) }
					</button>
				</div>
			</div>
		);
	},

	shouldShowPlanButton: function() {
		if ( this.props.selectedSite.jetpack ) {
			return true; // always show the plan button for jetpack sites (not the domain button)
		}
		return startsWith( this.props.path, '/domains' );
	},

	handleClick: function( event ) {
		event.preventDefault();

		page( ( this.shouldShowPlanButton() ? '/plans/' : '/domains/add/' ) + this.props.selectedSite.slug );
	}
});

module.exports = CartEmpty;
