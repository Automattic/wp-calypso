import { useSelector } from 'react-redux';
import { timezone } from 'calypso/lib/site/utils';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

// Returns the timezone of the selected site to be used in the line chart

function useSiteChartTimezone() {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const siteTimezone = timezone( site );
	return siteTimezone;
}

export default useSiteChartTimezone;
