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
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

import { getSelectedSiteId } from 'state/ui/selectors';
import SidebarItem from 'layout/sidebar/item';
import SidebarCustomIcon from 'layout/sidebar/custom-icon';
import StatsSparkline from 'blocks/stats-sparkline';

const onNav = () => null;

export const MySitesSidebarUnifiedItem = ( {
	title,
	icon,
	url,
	slug,
	selected = false,
	isSubItem = false,
} ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

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
			onNavigate={ onNav }
			selected={ selected }
			customIcon={ <SidebarCustomIcon icon={ icon } /> }
			forceInternalLink
			className={ isSubItem ? 'sidebar__menu-link--sub' : 'sidebar__menu-link--parent' }
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
