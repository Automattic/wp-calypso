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
import { useFirstMatchingBackupAttempt } from '../hooks';

type CanGoToDateHook = (
	selectedDate: Moment,
	oldestDateAvailable?: Moment
) => ( desiredDate: Moment ) => boolean;

export const useCanGoToDate: CanGoToDateHook = ( selectedDate, oldestDateAvailable ) => {
	const moment = useLocalizedMoment();
	const today = useDateWithOffset( moment() );

	return useCallback(
		( desiredDate ) => {
			const goingForwardInTime = desiredDate.isAfter( selectedDate, 'day' );
			const goingBackwardInTime = desiredDate.isBefore( selectedDate, 'day' );

			// If we're going backward in time, only go as far back as
			// the oldest date we have information on; if we don't know
			// the oldest date with data, always allow backward navigation.
			if ( goingBackwardInTime ) {
				return ! oldestDateAvailable || desiredDate.isSameOrAfter( oldestDateAvailable, 'day' );
			}

			// If we're going forward in time, just make sure we don't
			// let anyone accidentally slip into the future
			if ( goingForwardInTime ) {
				return desiredDate.isSameOrBefore( today );
			}

			// If we're going neither forward nor backward,
			// then everything's fine (this should never happen)
			return true;
		},
		[ selectedDate, today, oldestDateAvailable ]
	);
};

export const useFirstKnownBackupAttempt = ( siteId: number ) => {
	// @ts-expect-error: TypeScript thinks the options argument here
	// needs all its properties to be present, but they really don't
	return useFirstMatchingBackupAttempt( siteId, { sortOrder: 'asc' } );
};
