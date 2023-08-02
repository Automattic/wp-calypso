import { Moment } from 'moment';
import { useMemo } from 'react';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';

export default function useDateOffsetForSite(
	date: Moment | undefined | null,
	siteId: number,
	{ keepLocalTime = false } = {}
): Moment | undefined {
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
