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
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import { collapseAllMySitesSidebarSections } from 'calypso/state/my-sites/sidebar/actions';

export const MySitesSidebarUnifiedItem = ( {
	title,
	icon,
	url,
	slug,
	selected = false,
	isSubItem = false,
} ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const reduxDispatch = useDispatch();
	let children = null;

	// "Stats" item has sparkline inside of it
	const isStats = typeof slug === 'string' && slug.includes( '-comstats' );
	if ( isStats && selectedSiteId ) {
		children = <StatsSparkline className="sidebar-unified__sparkline" siteId={ selectedSiteId } />;
	}

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
			{ children }
		</SidebarItem>
	);
};

MySitesSidebarUnifiedItem.propTypes = {
	path: PropTypes.string,
	title: PropTypes.string,
	icon: PropTypes.string,
	url: PropTypes.string,
};

export default MySitesSidebarUnifiedItem;
