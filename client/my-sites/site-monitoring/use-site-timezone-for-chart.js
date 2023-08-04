import moment from 'moment-timezone';
import { useSelector } from 'react-redux';
import { timezone, gmtOffset } from 'calypso/lib/site/utils';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

// Returns the timezone of the selected site to be used in the line chart

function useSiteChartTimezone() {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const site = useSelector( ( state ) => getSite( state, siteId ) );

	const siteTimezoneString = timezone( site );

	// If siteTimezoneString is a string, return it directly
	if ( typeof siteTimezoneString === 'string' ) {
		return siteTimezoneString;
	}
	// Convert siteGmtOffset to a timezone string and return
	const siteGmtOffset = gmtOffset( site );
	const timezoneString = moment.tz.zone( siteGmtOffset ).name;

	return timezoneString;
}

export default useSiteChartTimezone;
