import { withShoppingCart } from '@automattic/shopping-cart';
import PropTypes from 'prop-types';
import React from 'react';
import { getAllCartItems } from 'calypso/lib/cart-values/cart-items';
import PopoverCart from './popover-cart';

class HeaderCart extends React.Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
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
		if ( isCartEmpty ) {
			return null;
		}

		return (
			<PopoverCart
				selectedSite={ this.props.selectedSite }
				visible={ this.state.isPopoverCartVisible }
				pinned={ false }
				path={ this.props.currentRoute }
				onToggle={ this.togglePopoverCart }
				compact
			/>
		);
	}
}

export default withShoppingCart( HeaderCart );
