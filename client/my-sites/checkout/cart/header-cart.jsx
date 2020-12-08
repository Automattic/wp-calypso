/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { getAllCartItems } from 'calypso/lib/cart-values/cart-items';
import PopoverCart from './popover-cart';

class HeaderCart extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		selectedSite: PropTypes.object.isRequired,
		currentRoute: PropTypes.string,
	};

	state = {
		isPopoverCartVisible: false,
	};

	togglePopoverCart = () => {
		this.setState( ( state ) => {
			return {
				isPopoverCartVisible: ! state.isPopoverCartVisible,
			};
		} );
	};

	render() {
		if ( isEmpty( getAllCartItems( this.props.cart ) ) ) {
			return null;
		}

		return (
			<PopoverCart
				cart={ this.props.cart }
				selectedSite={ this.props.selectedSite }
				visible={ this.state.isPopoverCartVisible }
				pinned={ false }
				path={ this.props.currentRoute }
				onToggle={ this.togglePopoverCart }
				closeSectionNavMobilePanel={ noop }
				compact
			/>
		);
	}
}

export default HeaderCart;
