/**
 * External dependencies
 */

import { startsWith } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';

class CartEmpty extends React.Component {
	render() {
		return (
			<div>
				<div className="cart-empty">
					{ this.props.translate( 'There are no items in your cart.' ) }
				</div>
				<div className="cart-empty__buttons cart-buttons">
					<button
						className="cart-empty__checkout-button cart-checkout-button button is-primary"
						onClick={ this.handleClick }
					>
						{ this.shouldShowPlanButton()
							? this.props.translate( 'Add a plan' )
							: this.props.translate( 'Add a domain' ) }
					</button>
				</div>
			</div>
		);
	}

	shouldShowPlanButton = () => {
		if ( this.props.selectedSite.jetpack ) {
			return true; // always show the plan button for jetpack sites (not the domain button)
		}
		return startsWith( this.props.path, '/domains' );
	};

	handleClick = ( event ) => {
		event.preventDefault();

		page(
			( this.shouldShowPlanButton() ? '/plans/' : '/domains/add/' ) + this.props.selectedSite.slug
		);
	};
}

export default localize( CartEmpty );
