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

/**
 * Internal dependencies
 */
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const MySitesSidebarUnifiedStatsSparkline = ( { slug } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isStats = typeof slug === 'string' && slug.includes( '-comstats' );

	if ( ! isStats || ! selectedSiteId ) {
		return null;
	}

	return <StatsSparkline className="sidebar-unified__sparkline" siteId={ selectedSiteId } />;
};

export default memo( MySitesSidebarUnifiedStatsSparkline );
