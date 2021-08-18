/**
 * External dependencies
 */
import { Moment } from 'moment';
import { useCallback } from 'react';

/**
 * Internal dependencies
 */
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useIsDateBeyondRetentionPeriod, useFirstMatchingBackupAttempt } from '../hooks';

type CanGoToDateHook = (
	siteId: number,
	selectedDate: Moment,
	oldestDateAvailable?: Moment
) => ( desiredDate: Moment ) => boolean;

export const useCanGoToDate: CanGoToDateHook = ( siteId, selectedDate, oldestDateAvailable ) => {
	const moment = useLocalizedMoment();
	const today = useDateWithOffset( moment() );
	const alreadyBeyondRetentionPeriod = useIsDateBeyondRetentionPeriod( siteId )( selectedDate );

	return useCallback(
		( desiredDate ) => {
			const goingForwardInTime = desiredDate.isAfter( selectedDate, 'day' );
			const goingBackwardInTime = desiredDate.isBefore( selectedDate, 'day' );

			if ( goingBackwardInTime ) {
				// If we're already further back in time than this site's
				// retention period allows, don't go any further
				//
				// NOTE: We intentionally allow navigation to one day
				// past the retention period, so we can show eligible
				// users the opportunity to upgrade
				if ( alreadyBeyondRetentionPeriod ) {
					return false;
				}

				// If we don't know the oldest date with data,
				// always allow backward navigation
				if ( ! oldestDateAvailable ) {
					return true;
				}

				// Only go as far back as the oldest date we have information on
				return desiredDate.isSameOrAfter( oldestDateAvailable, 'day' );
			}

			if ( goingForwardInTime ) {
				// Just make sure we don't let anyone accidentally slip
				// into the future
				return desiredDate.isSameOrBefore( today );
			}

			// If we're going neither forward nor backward,
			// then everything's fine (this should never happen)
			return true;
		},
		[ alreadyBeyondRetentionPeriod, selectedDate, today, oldestDateAvailable ]
	);
};

export const useFirstKnownBackupAttempt = ( siteId: number ) => {
	// @ts-expect-error: TypeScript thinks the options argument here
	// needs all its properties to be present, but they really don't
	return useFirstMatchingBackupAttempt( siteId, { sortOrder: 'asc' } );
};
