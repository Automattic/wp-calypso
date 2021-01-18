/**
 * External dependencies
 */
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

type GetDisplayDateHook = () => ( date: Moment ) => TranslateResult | undefined;

// We format a bit differently here than in
// calypso/components/jetpack/daily-backup-status
export const useGetDisplayDate: GetDisplayDateHook = () => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const today = applySiteOffset( moment(), { timezone, gmtOffset } );
	const yesterday = moment( today ).subtract( 1, 'day' );

	return useCallback(
		( date ) => {
			if ( ! date ) {
				return undefined;
			}

			const siteDate = applySiteOffset( date, { timezone, gmtOffset } );

			if ( siteDate.isSame( today, 'day' ) ) {
				return translate( 'Today %(time)s', {
					args: { time: siteDate.format( 'LT' ) },
					comment: '%(time)s is a localized representation of the time of day',
				} );
			}

			if ( siteDate.isSame( yesterday, 'day' ) ) {
				return translate( 'Yesterday %(time)s', {
					args: { time: siteDate.format( 'LT' ) },
					comment: '%(time)s is a localized representation of the time of day',
				} );
			}

			return siteDate.format( 'lll' );
		},
		[ timezone, gmtOffset, translate, today, yesterday ]
	);
};
