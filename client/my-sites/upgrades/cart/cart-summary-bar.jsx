/**
 * External dependencies
 */
var React = require('react');

var CartSummaryBar = React.createClass({
    render: function() {
        var itemCount = this.props.itemCount, text;

        text = this.translate('Cart');
        if (this.props.showItemCount && itemCount) {
            text = this.translate('Cart - %(count)d item', 'Cart - %(count)d items', {
                count: itemCount,
                args: { count: itemCount },
            });
        }

        return (
            <div
                className={'cart-summary-bar ' + this.props.additionalClasses}
                onClick={this.toggleVisibility}
            >
                {text}
            </div>
        );
    },

    toggleVisibility: function(event) {
        event.preventDefault();

        if (this.props.onClick) {
            this.props.onClick(event);
        }
    },
});

module.exports = CartSummaryBar;
