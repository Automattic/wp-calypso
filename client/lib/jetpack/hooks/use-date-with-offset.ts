import { Moment } from 'moment';
import { useMemo } from 'react';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

// Tolerates null settings values, unlike the implementation in `calypso/components/site-offset`;
// I don't want to disturb existing behavior, but we may want to come back later
// and DRY up this bit of code.
export default function useDateWithOffset(
	date: Moment | undefined | null,
	{ keepLocalTime = false } = {}
): Moment | undefined {
	const siteId = useSelector( getSelectedSiteId );

	const timezone = useSelector( ( state ) =>
		siteId ? getSiteTimezoneValue( state, siteId ) : null
	);
	const gmtOffset = useSelector( ( state ) =>
		siteId ? getSiteGmtOffset( state, siteId ) : null
	);

	const dateWithOffset = useMemo(
		() => ( date ? applySiteOffset( date, { timezone, gmtOffset, keepLocalTime } ) : undefined ),
		[ date, timezone, gmtOffset, keepLocalTime ]
	);

	return dateWithOffset;
}
