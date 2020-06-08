/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize, useTranslate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import Button from 'components/forms/form-button';
import { isSuccessfulDailyBackup, isSuccessfulRealtimeBackup } from 'lib/jetpack/backup-utils';
import {
	backupDownloadPath,
	backupRestorePath,
	backupMainPath,
	settingsPath,
} from 'my-sites/backup/paths';
import { applySiteOffset } from 'lib/site/timezone';
import { Card } from '@automattic/components';
import ActivityCard from 'components/jetpack/activity-card';
import ExternalLink from 'components/external-link';
import { INDEX_FORMAT } from 'my-sites/backup/main';
import BackupChanges from './backup-changes';

/**
 * Style dependencies
 */
import './style.scss';
import contactSupportUrl from 'lib/jetpack/contact-support-url';
import missingCredentialsIcon from './missing-credentials.svg';
import cloudErrorIcon from './icons/cloud-error.svg';
import cloudWarningIcon from './icons/cloud-warning.svg';
import cloudSuccessIcon from './icons/cloud-success.svg';
import cloudScheduleIcon from './icons/cloud-schedule.svg';

class DailyBackupStatus extends Component {
	getValidRestoreId = () => {
		const { dailyBackup, hasRealtimeBackups, realtimeBackups } = this.props;
		const realtimeBackup = get( realtimeBackups, '[0]', [] );
		return hasRealtimeBackups ? realtimeBackup.rewindId : dailyBackup.rewindId;
	};

	getDisplayDate = ( date, withLatest = true ) => {
		const { translate, moment, timezone, gmtOffset } = this.props;

		//Apply the time offset
		const backupDate = applySiteOffset( moment( date ), { timezone, gmtOffset } );
		const today = applySiteOffset( moment(), { timezone, gmtOffset } );

		const isToday = today.isSame( backupDate, 'day' );
		const yearToday = today.format( 'YYYY' );
		const yearDate = backupDate.format( 'YYYY' );

		const dateFormat = yearToday === yearDate ? 'MMM D' : 'MMM D, YYYY';
		const displayBackupTime = backupDate.format( 'LT' );

		let displayableDate;

		if ( isToday && withLatest ) {
			displayableDate = translate( 'Latest: Today %s', {
				args: [ displayBackupTime ],
				comment: '%s is the time of the last backup from today',
			} );
		} else if ( isToday ) {
			displayableDate = translate( 'Today %s', {
				args: [ displayBackupTime ],
				comment: '%s is the time of the last backup from today',
			} );
		} else if ( withLatest ) {
			displayableDate = translate( 'Latest: %s', {
				args: [ backupDate.format( dateFormat + ', LT' ) ],
			} );
		} else {
			displayableDate = backupDate.format( dateFormat + ', LT' );
		}

		return displayableDate;
	};

	renderGoodBackup( backup ) {
		const {
			allowRestore,
			dispatchRecordTracksEvent,
			doesRewindNeedCredentials,
			hasRealtimeBackups,
			siteSlug,
			deltas,
			// metaDiff,
			translate,
		} = this.props;
		const displayDate = this.getDisplayDate( backup.activityTs );
		const displayDateNoLatest = this.getDisplayDate( backup.activityTs, false );

		const meta = get( backup, 'activityDescription[2].children[0]', '' );

		// We should only showing the summarized ActivityCard for Real-time sites when the latest backup is not a full backup
		const showBackupDetails =
			hasRealtimeBackups && 'rewind__backup_complete_full' !== backup.activityName;

		return (
			<>
				<div className="daily-backup-status__message-head">
					<img src={ cloudSuccessIcon } alt="" role="presentation" />
					<div className="daily-backup-status__hide-mobile">{ translate( 'Latest backup' ) }</div>
				</div>
				<div className="daily-backup-status__hide-desktop">
					<div className="daily-backup-status__title">{ displayDate }</div>
				</div>
				<div className="daily-backup-status__hide-mobile">
					<div className="daily-backup-status__title">{ displayDateNoLatest }</div>
				</div>
				<div className="daily-backup-status__meta">{ meta }</div>
				<ActionButtons
					rewindId={ backup.rewindId }
					siteSlug={ siteSlug }
					disabledRestore={ ! allowRestore }
					doesRewindNeedCredentials={ doesRewindNeedCredentials }
					dispatchRecordTracksEvent={ dispatchRecordTracksEvent }
				/>
				{ showBackupDetails && this.renderBackupDetails( backup ) }
				{ /*{ ! hasRealtimeBackups && <BackupChanges { ...{ deltas, metaDiff } } /> }*/ }
				{ ! hasRealtimeBackups && <BackupChanges { ...{ deltas } } /> }
			</>
		);
	}

	renderFailedBackup( backup ) {
		const { translate, timezone, gmtOffset, siteUrl } = this.props;

		const backupDate = applySiteOffset( backup.activityTs, { timezone, gmtOffset } );

		const displayDate = backupDate.format( 'L' );
		const displayTime = backupDate.format( 'LT' );

		return (
			<>
				<div className="daily-backup-status__message-head">
					<img src={ cloudErrorIcon } alt="" role="presentation" />
					<div className="daily-backup-status__message-error">{ translate( 'Backup failed' ) }</div>
				</div>
				<div className="daily-backup-status__title">
					{ this.getDisplayDate( backup.activityTs, false ) }
				</div>
				<div className="daily-backup-status__label">
					<p>
						{ translate(
							'A backup for your site was attempted on %(displayDate)s at %(displayTime)s and was not ' +
								'able to be completed.',
							{ args: { displayDate, displayTime } }
						) }
					</p>
					<p>
						{ translate(
							'Check out the {{a}}backups help guide{{/a}} or contact our support team to resolve the ' +
								'issue.',
							{
								components: {
									a: (
										<a
											href="https://jetpack.com/support/backup/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
					<Button
						className="daily-backup-status__support-button"
						href={ contactSupportUrl( siteUrl ) }
						target="_blank"
						rel="noopener noreferrer"
						isPrimary={ false }
					>
						{ translate( 'Contact support' ) }
					</Button>
				</div>
			</>
		);
	}

	renderNoBackupEver() {
		const { translate, siteUrl } = this.props;

		return (
			<>
				<div className="daily-backup-status__message-head">
					<img src={ cloudWarningIcon } alt="" role="presentation" />
					<div>{ translate( 'No backups are available yet' ) }</div>
				</div>
				<div className="daily-backup-status__label">
					{ translate(
						'But don’t worry, one should become available in the next 24 hours. Contact support if you still need help.'
					) }
				</div>

				<Button
					className="daily-backup-status__support-button"
					href={ contactSupportUrl( siteUrl ) }
					target="_blank"
					rel="noopener noreferrer"
					isPrimary={ false }
				>
					{ translate( 'Contact support' ) }
				</Button>
			</>
		);
	}

	renderNoBackupOnDate() {
		const { translate, selectedDate, siteSlug, siteUrl } = this.props;

		const displayDate = selectedDate.format( 'll' );
		const nextDate = selectedDate.clone().add( 1, 'days' );
		const displayNextDate = nextDate.format( 'll' );

		return (
			<>
				<div className="daily-backup-status__message-head">
					<img
						className="daily-backup-status__warning-color"
						src={ cloudWarningIcon }
						alt=""
						role="presentation"
					/>
					<div className="daily-backup-status__title">{ translate( 'No backup' ) }</div>
				</div>

				<div className="daily-backup-status__label">
					<p>
						{ translate( 'The backup attempt for %(displayDate)s was delayed.', {
							args: { displayDate },
						} ) }
					</p>
					<p>
						{ translate(
							'But don’t worry, it was likely completed in the early hours the next morning. ' +
								'Check the following day, {{link}}%(displayNextDate)s{{/link}} or contact support if you still need help.',
							{
								args: { displayNextDate },
								components: {
									link: (
										<a
											href={ backupMainPath( siteSlug, {
												date: nextDate.format( INDEX_FORMAT ),
											} ) }
										/>
									),
								},
							}
						) }
					</p>
				</div>

				<Button
					className="daily-backup-status__support-button"
					href={ contactSupportUrl( siteUrl ) }
					target="_blank"
					rel="noopener noreferrer"
					isPrimary={ false }
				>
					{ translate( 'Contact support' ) }
				</Button>
			</>
		);
	}

	renderNoBackupToday( lastBackupDate ) {
		const { translate, timezone, gmtOffset, moment, siteSlug } = this.props;

		const today = applySiteOffset( moment(), {
			timezone: timezone,
			gmtOffset: gmtOffset,
		} );
		const yesterday = today.subtract( 1, 'days' );

		const lastBackupDay = lastBackupDate.isSame( yesterday, 'day' )
			? translate( 'Yesterday ' )
			: lastBackupDate.format( 'll' );

		const lastBackupTime = lastBackupDate.format( 'LT' );

		// Calculates the remaining hours for the next backup + 3 hours of safety margin
		const hoursForNextBackup =
			parseInt( lastBackupDate.format( 'H' ) ) - parseInt( today.format( 'H' ) ) + 3;

		const nextBackupHoursText =
			hoursForNextBackup === 1
				? translate( 'In the next hour' )
				: translate( 'In the next %d hour', 'In the next %d hours', {
						args: [ hoursForNextBackup ],
						count: hoursForNextBackup,
				  } );

		return (
			<>
				<div className="daily-backup-status__message-head">
					<img src={ cloudScheduleIcon } alt="" role="presentation" />
					<div className="daily-backup-status__hide-mobile">
						{ translate( 'Backup Scheduled' ) }
					</div>
				</div>
				<div className="daily-backup-status__title">
					<div className="daily-backup-status__hide-desktop">
						{ translate( 'Backup Scheduled' ) }:
					</div>
					<div>{ nextBackupHoursText }</div>
				</div>
				<div className="daily-backup-status__no-backup-last-backup">
					{ translate( 'Last daily backup: {{link}}%(lastBackupDay)s %(lastBackupTime)s{{/link}}', {
						args: { lastBackupDay, lastBackupTime },
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
				<ActionButtons disabledDownload={ true } disabledRestore={ true } />
			</>
		);
	}

	renderBackupDetails( backup ) {
		return (
			<div className="daily-backup-status__realtime-details">
				<div className="daily-backup-status__realtime-details-card">
					<ActivityCard activity={ backup } summarize />
				</div>
			</div>
		);
	}

	renderBackupStatus( backup ) {
		const {
			hasRealtimeBackups,
			selectedDate,
			lastDateAvailable,
			moment,
			timezone,
			gmtOffset,
		} = this.props;

		if ( backup && hasRealtimeBackups ) {
			return isSuccessfulRealtimeBackup( backup )
				? this.renderGoodBackup( backup )
				: this.renderFailedBackup( backup );
		} else if ( backup && ! hasRealtimeBackups ) {
			return isSuccessfulDailyBackup( backup )
				? this.renderGoodBackup( backup )
				: this.renderFailedBackup( backup );
		}

		if ( ! lastDateAvailable ) {
			return this.renderNoBackupEver();
		}

		const today = applySiteOffset( moment(), {
			timezone: timezone,
			gmtOffset: gmtOffset,
		} );

		const isToday = selectedDate.isSame( today, 'day' );
		if ( isToday ) {
			return this.renderNoBackupToday( lastDateAvailable );
		}

		return this.renderNoBackupOnDate();
	}

	render() {
		const { backup } = this.props;

		return (
			<div className="daily-backup-status">
				<Card className="daily-backup-status__success">{ this.renderBackupStatus( backup ) }</Card>
			</div>
		);
	}
}

const ActionButtons = ( {
	disabledDownload,
	disabledRestore,
	dispatchRecordTracksEvent,
	doesRewindNeedCredentials,
	rewindId,
	siteSlug,
} ) => {
	const translate = useTranslate();

	return (
		<>
			<Button
				className="daily-backup-status__download-button"
				href={ backupDownloadPath( siteSlug, rewindId ) }
				disabled={ disabledDownload }
				isPrimary={ false }
				onClick={ ( event ) => {
					disabledDownload &&
						event.preventDefault() &&
						dispatchRecordTracksEvent( 'calypso_jetpack_backup_download', { rewindId } );
				} }
			>
				{ translate( 'Download backup' ) }
			</Button>
			<Button
				className="daily-backup-status__restore-button"
				href={ backupRestorePath( siteSlug, rewindId ) }
				disabled={ disabledRestore || doesRewindNeedCredentials }
				onClick={ ( event ) => {
					( disabledRestore || doesRewindNeedCredentials ) &&
						event.preventDefault() &&
						dispatchRecordTracksEvent( 'calypso_jetpack_backup_restore', { rewindId } );
				} }
			>
				<div className="daily-backup-status__restore-button-icon">
					{ doesRewindNeedCredentials && (
						<img src={ missingCredentialsIcon } alt="" role="presentation" />
					) }
					<div>{ translate( 'Restore to this point' ) }</div>
				</div>
			</Button>
			{ doesRewindNeedCredentials && (
				<div className="daily-backup-status__credentials-warning">
					<div className="daily-backup-status__credentials-warning-top">
						<img src={ missingCredentialsIcon } alt="" role="presentation" />
						<div>{ translate( 'Restore points have not been enabled for your account' ) }</div>
					</div>

					<div className="daily-backup-status__credentials-warning-bottom">
						<div className="daily-backup-status__credentials-warning-text">
							{ translate(
								'A backup of your data has been made, but you must enter your server credentials to enable one-click restores. {{a}}Find your server credentials{{/a}}',
								{
									components: {
										a: (
											<ExternalLink
												icon
												href="https://jetpack.com/support/ssh-sftp-and-ftp-credentials/"
												onClick={ () => {} }
											/>
										),
									},
								}
							) }
						</div>
						<Button
							className="daily-backup-status__activate-restores-button"
							href={ settingsPath( siteSlug ) }
							isPrimary={ false }
							onClick={ () => {
								dispatchRecordTracksEvent( 'calypso_jetpack_backup_activate_click' );
							} }
						>
							{ translate( 'Activate restores' ) }
						</Button>
					</div>
				</div>
			) }
		</>
	);
};
ActionButtons.defaultProps = {
	disabledDownload: false,
	disabledRestore: false,
	doesRewindNeedCredentials: false,
};

export default localize( withLocalizedMoment( DailyBackupStatus ) );
