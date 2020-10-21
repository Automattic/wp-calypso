/**
 * MySitesSidebarUnifiedItem
 *
 * Renders a sidebar menu item with no child items.
 * This could be a top level item, or a child item nested under a top level menu.
 * These two cases might be to be split up?
 */
/**
 * External dependencies
 */
import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import MySitesSidebarUnifiedStatsSparkline from './sparkline';
import { collapseAllMySitesSidebarSections } from 'calypso/state/my-sites/sidebar/actions';

export const MySitesSidebarUnifiedItem = ( {
	title,
	icon,
	url,
	slug,
	selected = false,
	isSubItem = false,
} ) => {
	const reduxDispatch = useDispatch();

	return (
		<SidebarItem
			label={ title }
			link={ url }
			onNavigate={ () => reduxDispatch( collapseAllMySitesSidebarSections() ) }
			selected={ selected }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
			forceInternalLink
			className={ isSubItem ? 'sidebar__menu-item--child' : 'sidebar__menu-item-parent' }
		>
			<MySitesSidebarUnifiedStatsSparkline slug={ slug } />
		</SidebarItem>
	);
};

MySitesSidebarUnifiedItem.propTypes = {
	title: PropTypes.string,
	icon: PropTypes.string,
	url: PropTypes.string,
};

export default memo( MySitesSidebarUnifiedItem );
