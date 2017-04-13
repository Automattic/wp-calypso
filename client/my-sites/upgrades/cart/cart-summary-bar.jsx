/**
 * External dependencies
 */
var React = require( 'react' );

import SectionHeader from 'components/section-header';

var CartSummaryBar = React.createClass( {
	render: function() {
		var itemCount = this.props.itemCount,
			text;

		text = this.translate( 'Order Summary' );
		if ( this.props.showItemCount && itemCount ) {
			text = this.translate(
				'Cart - %(count)d item',
				'Cart - %(count)d items',
				{
					count: itemCount,
					args: { count: itemCount }
				}
			);
		}

		return (
			<div>
				<SectionHeader className="cart__header" label={ text } />
			</div>
		);
	},

	toggleVisibility: function( event ) {
		event.preventDefault();

		if ( this.props.onClick ) {
			this.props.onClick( event );
		}
	}
} );

module.exports = CartSummaryBar;
