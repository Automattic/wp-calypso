import { createSelector } from '@automattic/state-utils';
import i18n from 'i18n-calypso';
import moment from 'moment-timezone';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
			// Validate timezone string exists and is a valid IANA timezone identifier
			if ( timezoneString && timezoneString !== '' && moment.tz.zone( timezoneString ) ) {
				return moment.tz( dateInput, timezoneString ).locale( localeSlug );
			}

			if ( Number.isFinite( gmtOffset ) ) {
				// When parsing a date string (e.g., 'YYYY-MM-DD'), we interpret it as being in the site's timezone.
				// We use keepLocalTime: true to preserve the date/time value while changing the offset.
				if ( typeof dateInput === 'string' ) {
					return moment.parseZone( dateInput ).utcOffset( gmtOffset, true ).locale( localeSlug );
				}

				// For Date objects or undefined (current time), we convert the exact instant to the site's timezone.
				return moment( dateInput ).utcOffset( gmtOffset ).locale( localeSlug );
			}

			// Falls back to the browser's local timezone if no GMT offset is found
			return moment( dateInput ).locale( localeSlug );
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
