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
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordGoogleEvent } from 'state/analytics/actions';
import MenuItemTypeLabel from './menu-item-type-label';

const MenuPanelBackButton = ( props ) => {
	const { label, name, onClick } = props;
	const clickHandler = () => {
		props. recordGoogleEvent( 'Menus', 'Clicked Mobile Menu Item Types Back' );
		onClick();
	};

	return (
		<div className="menu-item-back-button">
			<a onClick={ clickHandler } className="noticon noticon-previous">
				<MenuItemTypeLabel name={ name } label={ label } />
			</a>
		</div>
	);
};

export default connect(
	() => ( {} ),
	{ recordGoogleEvent }
)( MenuPanelBackButton );
