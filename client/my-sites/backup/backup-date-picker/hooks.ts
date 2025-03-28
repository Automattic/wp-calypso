import { Moment } from 'moment';
import { useCallback } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { useFirstMatchingBackupAttempt } from '../hooks';

type CanGoToDateHook = (
	siteId: number,
	selectedDate: Moment,
	oldestDateAvailable?: Moment,
	hasNoBackups?: boolean
) => ( desiredDate: Moment ) => boolean;

export const useCanGoToDate: CanGoToDateHook = (
	siteId,
	selectedDate,
	oldestDateAvailable,
	hasNoBackups
) => {
	const moment = useLocalizedMoment();
	const today = useDateWithOffset( moment() );

	return useCallback(
		( desiredDate ) => {
			const goingForwardInTime = desiredDate.isAfter( selectedDate, 'day' );
			const goingBackwardInTime = desiredDate.isBefore( selectedDate, 'day' );

			if ( goingBackwardInTime ) {
				// If there are no backups, we won't show the navigation
				if ( hasNoBackups ) {
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
		[ selectedDate, today, oldestDateAvailable, hasNoBackups ]
	);
};

export const useFirstKnownBackupAttempt = ( siteId: number ) => {
	return useFirstMatchingBackupAttempt( siteId, { sortOrder: 'asc' } );
};
