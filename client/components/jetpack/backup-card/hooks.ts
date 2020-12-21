/**
 * External dependencies
 */
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import { useCallback } from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';

type GetDisplayDateHook = () => ( date: Moment ) => TranslateResult | undefined;

// We format a bit differently here than in
// calypso/components/jetpack/daily-backup-status
export const useGetDisplayDate: GetDisplayDateHook = () => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const today = useDateWithOffset( moment() );
	const yesterday = moment( today ).subtract( 1, 'day' );

	return useCallback(
		( date ) => {
			if ( ! date ) {
				return undefined;
			}

			if ( date.isSame( today, 'day' ) ) {
				return translate( 'Today %(time)s', {
					args: { time: date.format( 'LT' ) },
					comment: '%(time)s is a localized representation of the time of day',
				} );
			}

			if ( date.isSame( yesterday, 'day' ) ) {
				return translate( 'Yesterday %(time)s', {
					args: { time: date.format( 'LT' ) },
					comment: '%(time)s is a localized representation of the time of day',
				} );
			}

			return date.format( 'lll' );
		},
		[ translate, today, yesterday ]
	);
};
