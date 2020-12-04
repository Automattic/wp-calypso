/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { Card } from '@automattic/components';
import {
	isSuccessfulDailyBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import BackupFailed from './status-card/backup-failed';
import BackupScheduled from './status-card/backup-scheduled';
import BackupSuccessful from './status-card/backup-successful';
import NoBackupsOnSelectedDate from './status-card/no-backups-on-selected-date';
import NoBackupsYet from './status-card/no-backups-yet';

/**
 * Style dependencies
 */
import './style.scss';

const DailyBackupStatus = ( { selectedDate, lastBackupDate, backup, deltas } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const hasRealtimeBackups = useSelector( ( state ) => {
		const capabilities = getRewindCapabilities( state, siteId );
		return isArray( capabilities ) && capabilities.includes( 'backup-realtime' );
	} );

	const moment = useLocalizedMoment();
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	if ( backup ) {
		const isSuccessful = hasRealtimeBackups ? isSuccessfulRealtimeBackup : isSuccessfulDailyBackup;

		return isSuccessful( backup ) ? (
			<BackupSuccessful backup={ backup } deltas={ deltas } selectedDate={ selectedDate } />
		) : (
			<BackupFailed backup={ backup } />
		);
	}

	if ( lastBackupDate ) {
		const today = applySiteOffset( moment(), {
			timezone: timezone,
			gmtOffset: gmtOffset,
		} );

		const selectedToday = selectedDate.isSame( today, 'day' );
		return selectedToday ? (
			<BackupScheduled lastBackupDate={ lastBackupDate } />
		) : (
			<NoBackupsOnSelectedDate selectedDate={ selectedDate } />
		);
	}

	return <NoBackupsYet />;
};

DailyBackupStatus.propTypes = {
	selectedDate: PropTypes.object.isRequired, // Moment object
	lastBackupDate: PropTypes.object, // Moment object
	backup: PropTypes.object,
	deltas: PropTypes.object,
};

const Wrapper = ( props ) => (
	<Card className="daily-backup-status">
		<DailyBackupStatus { ...props } />
	</Card>
);

export default Wrapper;
