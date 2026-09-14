import { isEcommercePlan } from '@automattic/calypso-products';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const MySitesSidebarUnifiedStatsSparkline = ( { slug } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, selectedSiteId ) );
	const isStats = typeof slug === 'string' && slug.includes( '-comstats' );

	if ( ! isStats || ! selectedSiteId || isEcommercePlan( sitePlanSlug ) ) {
		return null;
	}

	return <StatsSparkline className="sidebar__sparkline" siteId={ selectedSiteId } />;
};

export default memo( MySitesSidebarUnifiedStatsSparkline );
