/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

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
		const isCartEmpty = getAllCartItems( this.props.cart ).length === 0;
		let isVisible = this.state.isPopoverCartVisible;
		if ( isCartEmpty ) {
			isVisible = false;
		}

		return (
			<PopoverCart
				cart={ this.props.cart }
				selectedSite={ this.props.selectedSite }
				visible={ isVisible }
				pinned={ false }
				path={ this.props.currentRoute }
				onToggle={ this.togglePopoverCart }
				compact
			/>
		);
	}
}

export default HeaderCart;
