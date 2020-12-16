/**
 * External dependencies
 */
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { MomentInput } from 'moment';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';

type DisplayDateHook = ( siteId: number ) => ( date: MomentInput ) => TranslateResult | undefined;

export const useGetDisplayDateForSite: DisplayDateHook = ( siteId ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );

	return useCallback(
		( date ) => {
			if ( ! date ) {
				return undefined;
			}

			const siteDate = applySiteOffset( date, { gmtOffset, timezone } );

			const today = applySiteOffset( moment(), { gmtOffset, timezone } );
			if ( siteDate.isSame( today, 'day' ) ) {
				return translate( 'Today %(time)s', {
					args: { time: siteDate.format( 'LT' ) },
					comment: '%(time)s is a localized representation of the time of day',
				} );
			}

			const yesterday = moment( today ).subtract( 1, 'day' );
			if ( siteDate.isSame( yesterday, 'day' ) ) {
				return translate( 'Yesterday %(time)s', {
					args: { time: siteDate.format( 'LT' ) },
					comment: '%(time)s is a localized representation of the time of day',
				} );
			}

			return siteDate.format( 'LLL' );
		},
		[ moment, translate, gmtOffset, timezone ]
	);
};
