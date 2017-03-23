/**
 * External dependencies
 */
var React = require('react');

/**
 * Internal dependencies
 */
var CartItem = require('./cart-item'), cartItems = require('lib/cart-values').cartItems;

var COLLAPSED_ITEMS_COUNT = 2;

var CartItems = React.createClass({
    propTypes: {
        collapse: React.PropTypes.bool.isRequired,
    },

    getInitialState: function() {
        return { isCollapsed: this.props.collapse };
    },

    handleExpand: function(event) {
        event.preventDefault();

        // If we call setState here directly, it would remove the expander from DOM,
        // and then click-outside from Popover would consider it as an outside click,
        // and it would close the Popover cart.
        // event.stopPropagation() does not help.
        setTimeout(this.setState.bind(this, { isCollapsed: false }), 0);
    },

    collapseItems: function(items) {
        var collapsedItemsCount = items.length - COLLAPSED_ITEMS_COUNT,
            collapsedItems = items.slice(0, COLLAPSED_ITEMS_COUNT);

        collapsedItems.push(
            <li key="items-expander">
                <a className="cart-items__expander" href="#" onClick={this.handleExpand}>
                    {this.translate('+ %(count)d more item', '+ %(count)d more items', {
                        count: collapsedItemsCount,
                        args: { count: collapsedItemsCount },
                    })}
                </a>
            </li>
        );

        return collapsedItems;
    },

    render: function() {
        var cart = this.props.cart, items;

        if (!cartItems.getAll(cart)) {
            return;
        }

        items = cartItems.getAllSorted(cart).map(
            function(cartItem) {
                return (
                    <CartItem
                        cart={cart}
                        cartItem={cartItem}
                        selectedSite={this.props.selectedSite}
                        key={cartItem.product_id + '-' + cartItem.meta}
                    />
                );
            },
            this
        );

        if (this.state.isCollapsed && items.length > COLLAPSED_ITEMS_COUNT + 1) {
            items = this.collapseItems(items);
        }

        return <ul className="cart-items">{items}</ul>;
    },
});

module.exports = CartItems;
