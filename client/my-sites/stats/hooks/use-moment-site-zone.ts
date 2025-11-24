import { createSelector } from '@automattic/state-utils';
import i18n from 'i18n-calypso';
import moment from 'moment-timezone';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DATE_FORMAT } from '../constants';

export const getMomentSiteZone = createSelector(
	( state: object, siteId: number | null, dateFormat = DATE_FORMAT ) => {
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
				if ( dateInput === undefined ) {
					return moment.tz( timezoneString ).locale( localeSlug );
				}
				return moment.tz( dateInput, timezoneString ).locale( localeSlug );
			}

			if ( Number.isFinite( gmtOffset ) ) {
				if ( dateInput === undefined ) {
					// In all the components, `moment` is directly used, which defaults to the browser's local timezone.
					// As a result, we need to convert the moment object to the site's timezone for easier comparison like `isSame`.
					return moment( moment().utcOffset( gmtOffset ).format( dateFormat ) ).locale(
						localeSlug
					);
				}
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
