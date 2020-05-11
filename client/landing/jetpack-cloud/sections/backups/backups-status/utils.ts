/**
 * External dependencies
 */
import moment, { Moment } from 'moment';

/**
 * Internal dependencies
 */
import { isActivityBackup } from '../utils';
import { applySiteOffsetType } from 'landing/jetpack-cloud/components/site-offset';

export const INDEX_FORMAT = 'YYYYMMDD';

export interface Activity {
	activityTs: number;
	activityIsRewindable: boolean;
}

export interface IndexedActivities {
	indexedLog: {
		[ date: string ]: Activity[];
	};
	oldestDateAvailable: Moment;
	lastDateAvailable: Moment | null;
}

// Creates an indexed log of backups based on the date of the backup and in the site time zone.
export const createIndexedLog = (
	logs: Activity[],
	applySiteOffset: applySiteOffsetType
): IndexedActivities => {
	const indexedLog: {
		[ date: string ]: Activity[];
	} = {};
	// let oldestDateAvailable = applySiteOffset( momentDate(), {
	// 	timezone,
	// 	gmtOffset,
	// } );
	let oldestDateAvailable = moment();
	let lastDateAvailable: Moment | null = null;

	logs.forEach( ( log ) => {
		//Move the backup date to the site timezone
		const backupDate = applySiteOffset( moment( log.activityTs ) );
		//Get the index for this backup, index format: YYYYMMDD
		const index = backupDate.format( INDEX_FORMAT );

		if ( ! ( index in indexedLog ) ) {
			//The first time we create the index for this date
			indexedLog[ index ] = [];
		}

		// Check for the oldest and the last backup dates
		if ( isActivityBackup( log ) || log.activityIsRewindable ) {
			if ( backupDate < oldestDateAvailable ) {
				oldestDateAvailable = backupDate;
			}
			if ( lastDateAvailable === null || backupDate > lastDateAvailable ) {
				lastDateAvailable = backupDate;
			}
		}

		indexedLog[ index ].push( log );
	} );

	return {
		indexedLog,
		oldestDateAvailable,
		lastDateAvailable,
	};
};
