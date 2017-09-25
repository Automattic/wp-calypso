/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CartItem from './cart-item';
import { cartItems } from 'lib/cart-values';
import { localize } from 'i18n-calypso';

const COLLAPSED_ITEMS_COUNT = 2;

export class CartItems extends React.Component {

	static propTypes = {
		collapse: React.PropTypes.bool.isRequired
	};

	constructor( props ) {
		super( props );

		this.state = {
			isCollapsed: props.collapse
		};
	}

	handleExpand = ( event ) => {
		event.preventDefault();

		// If we call setState here directly, it would remove the expander from DOM,
		// and then click-outside from Popover would consider it as an outside click,
		// and it would close the Popover cart.
		// event.stopPropagation() does not help.
		setTimeout( () => {
			this.setState( { isCollapsed: false } );
		} );
	}

	collapseItems( items ) {
		let collapsedItemsCount = items.length - COLLAPSED_ITEMS_COUNT,
			collapsedItems = items.slice( 0, COLLAPSED_ITEMS_COUNT );

		collapsedItems.push(
			<li key="items-expander">
				<a className="cart-items__expander" href="#" onClick={ this.handleExpand }>
					{ this.props.translate(
						'+ %(count)d more item',
						'+ %(count)d more items',
						{
							count: collapsedItemsCount,
							args: { count: collapsedItemsCount }
						}
					) }
				</a>
			</li>
		);

		return collapsedItems;
	}

	render() {
		const { cart } = this.props;

		if ( ! cartItems.getAll( cart ) ) {
			return;
		}

		let items = cartItems.getAllSorted( cart ).map( cartItem => {
			return (
				<CartItem
					cart={ cart }
					cartItem={ cartItem }
					selectedSite={ this.props.selectedSite }
					key={ cartItem.product_id + '-' + cartItem.meta } />
			);
		} );

		if ( this.state.isCollapsed && items.length > COLLAPSED_ITEMS_COUNT + 1 ) {
			items = this.collapseItems( items );
		}

		return <ul className="cart-items">{ items }</ul>;
	}
}

export default localize( CartItems );

