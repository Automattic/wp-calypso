import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useScheduledTimeQuery from 'calypso/data/jetpack-backup/use-scheduled-time-query';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { convertHourToRange } from './utils';

export const useNextBackupSchedule = () => {
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const { data, isSuccess } = useScheduledTimeQuery( siteId );

	const getNextBackupDate = () => {
		if ( ! data || data.scheduledHour === null ) {
			return null;
		}

		const currentTime = moment();
		const backupTimeUtc = moment.utc().startOf( 'day' ).hour( data.scheduledHour );

		let nextBackupDate = backupTimeUtc;

		// Apply site offset if available
		if ( timezone && gmtOffset ) {
			nextBackupDate = applySiteOffset( backupTimeUtc, { timezone, gmtOffset } );
		} else {
			nextBackupDate = backupTimeUtc.local();
		}

		const nextBackupDateEnd = nextBackupDate.clone().add( 59, 'minutes' ).add( 59, 'seconds' );

		// Only move to the next day if the current time is after the backup window
		if ( currentTime.isAfter( nextBackupDateEnd ) ) {
			nextBackupDate.add( 1, 'day' ); // Move to next day
		}

		return nextBackupDate;
	};

	const nextBackupDate = getNextBackupDate();

	if ( ! nextBackupDate ) {
		return {
			hasLoaded: isSuccess,
			date: null,
			timeRange: null,
		};
	}

	const timeRange = convertHourToRange( moment, nextBackupDate.hour() );

	return {
		hasLoaded: isSuccess,
		date: nextBackupDate,
		timeRange: timeRange,
	};
};
