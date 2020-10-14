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
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import StatsSparkline from 'calypso/blocks/stats-sparkline';

const onNav = () => null;

const MySitesSidebarUnifiedStatsSparkline = memo( ( { slug } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isStats = typeof slug === 'string' && slug.includes( '-comstats' );

	if ( isStats && selectedSiteId ) {
		return null;
	}

	return <StatsSparkline className="sidebar-unified__sparkline" siteId={ selectedSiteId } />;
} );

export const MySitesSidebarUnifiedItem = ( {
	title,
	icon,
	url,
	slug,
	selected = false,
	isSubItem = false,
} ) => {
	return (
		<SidebarItem
			label={ title }
			link={ url }
			onNavigate={ onNav }
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
