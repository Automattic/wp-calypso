/**
 * External dependencies
 */

import { startsWith } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

class CartEmpty extends React.Component {
	render() {
		return (
			<div>
				<div className="cart-empty">
					{ this.props.translate( 'There are no items in your cart.' ) }
				</div>
				<div className="cart-empty__buttons cart-buttons">
					<Button
						primary
						className="cart-empty__checkout-button cart-checkout-button"
						onClick={ this.handleClick }
					>
						{ this.shouldShowPlanButton()
							? this.props.translate( 'Add a plan' )
							: this.props.translate( 'Add a domain' ) }
					</Button>
				</div>
			</div>
		);
	}

	shouldShowPlanButton = () => {
		const { path, selectedSite } = this.props;
		if ( selectedSite.jetpack && ! selectedSite.options.is_automated_transfer ) {
			return true; // always show the plan button for jetpack sites (not the domain button)
		}
		return ! startsWith( path, '/domains' );
	};

	handleClick = ( event ) => {
		event.preventDefault();

		page(
			( this.shouldShowPlanButton() ? '/plans/' : '/domains/add/' ) + this.props.selectedSite.slug
		);
	};
}

export default localize( CartEmpty );
