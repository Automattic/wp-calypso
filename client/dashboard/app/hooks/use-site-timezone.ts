import { type Site, type SiteSettings } from '@automattic/api-core';
import { siteSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

const selectTimezone = ( s: SiteSettings | undefined ) => ( {
	gmtOffset: Number( s?.gmt_offset ) || 0,
	timezoneString: s?.timezone_string || undefined,
} );

export function useSiteTimezone( siteId: number ) {
	return useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: selectTimezone,
	} ).data;
}

// Sites with a Jetpack connection error can't reach the settings endpoint, so we
// skip the fetch and fall back to UTC defaults to keep the page accessible. Uses a
// non-suspense query because the fetch has to be conditional on reachability.
export function useSiteTimezoneWithJetpackFallback( site: Site ) {
	const isReachable = ! site.__inaccessible_jetpack_error;
	const { data } = useQuery( {
		...siteSettingsQuery( site.ID ),
		enabled: isReachable,
		select: selectTimezone,
	} );

	return isReachable && data ? data : { gmtOffset: 0, timezoneString: undefined };
}
