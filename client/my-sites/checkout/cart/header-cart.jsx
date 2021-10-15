import { withShoppingCart } from '@automattic/shopping-cart';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { getAllCartItems } from 'calypso/lib/cart-values/cart-items';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import PopoverCart from './popover-cart';

class HeaderCart extends Component {
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

export default withCartKey( withShoppingCart( HeaderCart ) );
