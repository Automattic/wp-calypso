/**
 * External dependencies
 */
import { ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { AppState } from 'calypso/types';
import { preventWidows } from 'calypso/lib/formatting';
import { Interval, EVERY_SECOND } from 'calypso/lib/interval';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useGetDisplayDateForSite } from '../hooks';

/**
 * Style dependencies
 */
import './style.scss';
import cloudScheduleIcon from './icons/cloud-schedule.svg';

const getInProgressBackup = ( state: AppState, siteId: number ) => {
	const backups = getRewindBackups( state, siteId );
	return backups?.length ? backups.find( ( b ) => b.status === 'started' ) : undefined;
};

const BackupInProgress: React.FC< Props > = ( { lastBackupDate } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const getDisplayDate = useGetDisplayDateForSite( siteId );

	const refreshBackupProgress = useCallback( () => dispatch( requestRewindBackups( siteId ) ), [
		dispatch,
		siteId,
	] );

	const siteSlug = useSelector( getSelectedSiteSlug );

	const inProgressBackup = useSelector( ( state ) => getInProgressBackup( state, siteId ) );

	// If we don't already know there's a backup in progress, how did we even get here?
	// There's no sensible way to move forward, so render nothing
	if ( ! inProgressBackup ) {
		return null;
	}

	// Dates from the backup status API are always returned in terms of UTC+0
	const inProgressDisplayDate = getDisplayDate( moment.utc( inProgressBackup.started ) );
	const lastBackupDisplayDate = lastBackupDate ? getDisplayDate( lastBackupDate ) : undefined;

	// NOTE: Once we know the backup is complete, DailyBackupStatus should
	// automatically update and switch to a more appropriate state
	return (
		<>
			<Interval onTick={ refreshBackupProgress } period={ EVERY_SECOND } />
			<div className="status-card__message-head">
				<img src={ cloudScheduleIcon } alt="" role="presentation" />
				<div className="status-card__hide-mobile">{ translate( 'Backup In Progress' ) }</div>
			</div>
			<div className="status-card__title">
				<div className="status-card__hide-desktop">{ translate( 'Backup In Progress' ) }:</div>
			</div>

			<p className="status-card__label">
				{ translate(
					"We're making a backup of your site from {{strong}}%(inProgressDisplayDate)s{{/strong}}.",
					{
						args: {
							inProgressDisplayDate: preventWidows( inProgressDisplayDate ),
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>

			<ProgressBar value={ inProgressBackup.percent } total={ 100 } />

			{ lastBackupDate && (
				<div className="status-card__no-backup-last-backup">
					{ translate( 'Last backup before today: {{link}}%(lastBackupDisplayDate)s{{/link}}', {
						args: { lastBackupDisplayDate },
						components: {
							link: (
								<a
									href={ backupMainPath( siteSlug, {
										date: lastBackupDate.format( INDEX_FORMAT ),
									} ) }
								/>
							),
						},
					} ) }
				</div>
			) }
		</>
	);
};

type Props = {
	lastBackupDate?: Moment;
};

export default BackupInProgress;
