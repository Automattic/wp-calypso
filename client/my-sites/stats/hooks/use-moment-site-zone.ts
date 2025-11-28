import { createSelector } from '@automattic/state-utils';
import i18n from 'i18n-calypso';
import moment from 'moment-timezone';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Selector that returns a function to create moment objects in the site's timezone.
 *
 * The returned function's behavior depends on the input type:
 * - Naive date string ('2024-01-15'): Interprets AS the site's timezone (midnight in site TZ)
 * - Date object: Converts TO the site's timezone (preserves absolute time)
 * - ISO string with timezone ('2024-01-15T10:30:00-05:00'): Converts TO the site's timezone
 * - Undefined: Returns current time in the site's timezone
 *
 * @example
 * const momentSiteZone = getMomentSiteZone(state, siteId);
 * momentSiteZone('2024-01-15')                    // Jan 15, 2024 at midnight in site TZ
 * momentSiteZone(new Date('2024-01-15T10:00Z'))   // Converts UTC time to site TZ
 * momentSiteZone()                                 // Current time in site TZ
 */
export const getMomentSiteZone = createSelector(
	( state: object, siteId: number | null ) => {
		const localeSlug = i18n.getLocaleSlug() || 'en';
		const timezoneString =
			getSiteTimezoneValue( state, siteId as number ) ||
			( getSiteOption( state, siteId, 'timezone_string' ) as string );
		const gmtOffset =
			getSiteGmtOffset( state, siteId as number ) ||
			( getSiteOption( state, siteId, 'gmt_offset' ) as number );

		return ( dateInput?: moment.MomentInput ) => {
			// Case 1: Site has IANA timezone (e.g., 'America/New_York')
			// This is the best option as it handles DST automatically
			if ( timezoneString && timezoneString !== '' && moment.tz.zone( timezoneString ) ) {
				return moment.tz( dateInput, timezoneString ).locale( localeSlug );
			}

			// Case 2: Site has GMT offset only (e.g., -5 for EST)
			// Note: This doesn't handle DST, so times may be off during summer/winter
			if ( Number.isFinite( gmtOffset ) ) {
				// Determine if the input is a naive date string (no timezone info)
				const isNaiveDateString =
					typeof dateInput === 'string' && ! /[+-]\d{2}:\d{2}|Z/i.test( dateInput );

				if ( isNaiveDateString ) {
					// Naive string like '2024-01-15' or '2024-01-15 10:30'
					// Parse as UTC, then shift to site offset while keeping the wall-clock time
					// Result: '2024-01-15 00:00:00' interpreted in site timezone
					return moment.utc( dateInput ).utcOffset( gmtOffset, true ).locale( localeSlug );
				}

				// Date object, moment instance, or string with timezone
				// Convert the absolute time to the site's timezone
				return moment( dateInput ).utcOffset( gmtOffset ).locale( localeSlug );
			}

			// Case 3: No timezone info available
			// Fall back to browser's local timezone
			return ( dateInput !== undefined ? moment( dateInput ) : moment() ).locale( localeSlug );
		};
	},
	[
		( state, siteId ) => getSiteGmtOffset( state, siteId as number ),
		( state, siteId ) => getSiteTimezoneValue( state, siteId as number ),
		( state, siteId ) => getSiteOption( state, siteId, 'gmt_offset' ),
		( state, siteId ) => getSiteOption( state, siteId, 'timezone_string' ),
		() => i18n.getLocaleSlug(),
	]
);

/**
 * Hook to get a function that creates a moment object in the site's timezone.
 */
export function useMomentInSite( siteIdInput?: number | null ) {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteId = siteIdInput ?? selectedSiteId;
	return useSelector( ( state ) => getMomentSiteZone( state, siteId ) );
}
