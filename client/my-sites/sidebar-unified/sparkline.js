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
