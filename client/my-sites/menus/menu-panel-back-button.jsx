/**
 * A specialized mobile-only button shown inside a menu item's Edit view
 * (MenuEditableItem) to navigate from the item's options view for the selected
 * type (e.g. pages list for Page type, URL field for Link type) back to the
 * type selector (Page, Link, Category, etc.).
 *
 * This allows the two-panel interface of MenuEditableItem to be narrowed down
 * to one panel shown at a time on narrow viewports.
 */

/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

var MenuPanelBackButton = React.createClass( {

	onClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Mobile Menu Item Types Back' );
		this.props.onClick();
	},

	render: function() {
		return (
			<div className="menu-item-back-button">
				<a onClick={ this.onClick } className="noticon noticon-previous">{ this.props.label }</a>
			</div>
		);
	}

} );


module.exports = MenuPanelBackButton;
