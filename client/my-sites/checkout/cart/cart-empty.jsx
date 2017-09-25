/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { startsWith } from 'lodash';
import page from 'page';
import React from 'react';

const CartEmpty = React.createClass( {
	render: function() {
		return (
		    <div>
				<div className="cart-empty">
					{ this.props.translate( 'There are no items in your cart.' ) }
				</div>
				<div className="cart-buttons">
					<button className="cart-checkout-button button is-primary"
							onClick={ this.handleClick }>
							{ this.shouldShowPlanButton() ? this.props.translate( 'Add a Plan' ) : this.props.translate( 'Add a Domain' ) }
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
} );

export default localize( CartEmpty );
