/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Gridicon from 'components/gridicon';

class CartSummaryBar extends React.Component {
	render() {
		const { itemCount, showItemCount, translate } = this.props;

		let text = translate( 'Order Summary' );
		if ( showItemCount && itemCount ) {
			text = translate( 'Cart - %(count)d item', 'Cart - %(count)d items', {
				count: itemCount,
				args: { count: itemCount },
			} );
		}

		return (
			<div>
				<SectionHeader className="cart__header" label={ text }>
					<Gridicon icon="cart" size={ 18 } />
				</SectionHeader>
			</div>
		);
	}

	toggleVisibility = ( event ) => {
		event.preventDefault();

		if ( this.props.onClick ) {
			this.props.onClick( event );
		}
	};
}

export default localize( CartSummaryBar );
