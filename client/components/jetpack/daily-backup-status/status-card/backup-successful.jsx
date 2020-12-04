/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { get, isArray } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import ActivityCard from 'calypso/components/activity-card';
import ActionButtons from '../action-buttons';
import BackupChanges from '../backup-changes';
import useGetDisplayDate from '../use-get-display-date';

/**
 * Style dependencies
 */
import './style.scss';
import cloudSuccessIcon from './icons/cloud-success.svg';

const BackupSuccessful = ( { backup, deltas, selectedDate } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const hasRealtimeBackups = useSelector( ( state ) => {
		const capabilities = getRewindCapabilities( state, siteId );
		return isArray( capabilities ) && capabilities.includes( 'backup-realtime' );
	} );

	const moment = useLocalizedMoment();
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const getDisplayDate = useGetDisplayDate();
	const displayDate = getDisplayDate( backup.activityTs );
	const displayDateNoLatest = getDisplayDate( backup.activityTs, false );

	const today = applySiteOffset( moment(), {
		timezone: timezone,
		gmtOffset: gmtOffset,
	} );
	const isToday = selectedDate.isSame( today, 'day' );

	const meta = get( backup, 'activityDescription[2].children[0]', '' );

	// We should only showing the summarized ActivityCard for Real-time sites when the latest backup is not a full backup
	const showBackupDetails =
		hasRealtimeBackups &&
		( 'rewind__backup_complete_full' !== backup.activityName ||
			'rewind__backup_only_complete_full' !== backup.activityName );

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudSuccessIcon } alt="" role="presentation" />
				<div className="status-card__hide-mobile">
					{ isToday ? translate( 'Latest backup' ) : translate( 'Latest backup on this day' ) }
				</div>
			</div>
			<div className="status-card__hide-desktop">
				<div className="status-card__title">{ displayDate }</div>
			</div>
			<div className="status-card__hide-mobile">
				<div className="status-card__title">{ displayDateNoLatest }</div>
			</div>
			<div className="status-card__meta">{ meta }</div>
			<ActionButtons rewindId={ backup.rewindId } />
			{ showBackupDetails && (
				<div className="status-card__realtime-details">
					<div className="status-card__realtime-details-card">
						<ActivityCard activity={ backup } summarize />
					</div>
				</div>
			) }
			{ ! hasRealtimeBackups && <BackupChanges deltas={ deltas } /* metaDiff={ metaDiff */ /> }
		</>
	);
};

export default BackupSuccessful;
