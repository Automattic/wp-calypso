import { siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useSiteTimezone( siteId: number ) {
	return useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} ).data;
}
