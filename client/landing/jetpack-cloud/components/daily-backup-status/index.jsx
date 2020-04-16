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
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { isSuccessfulBackup } from 'landing/jetpack-cloud/sections/backups/utils';
import {
	/*backupDetailPath,*/ backupDownloadPath,
	backupRestorePath,
	backupMainPath,
} from 'landing/jetpack-cloud/sections/backups/paths';
import { applySiteOffset } from 'lib/site/timezone';
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const INDEX_FORMAT = 'YYYYMMDD';

class DailyBackupStatus extends Component {
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
		const { allowRestore, siteSlug, translate } = this.props;

		const displayDate = this.getDisplayDate( backup.activityTs );

		const meta = get( backup, 'activityDescription[2].children[0]', '' );

		return (
			<>
				<div className="daily-backup-status__icon-section">
					<Gridicon className="daily-backup-status__status-icon" icon="cloud-upload" />
					<div className="daily-backup-status__title">{ translate( 'Latest backup' ) }</div>
				</div>
				<div className="daily-backup-status__date">{ displayDate }</div>
				<div className="daily-backup-status__meta">{ meta }</div>
				<ActionButtons
					rewindId={ backup.rewindId }
					siteSlug={ siteSlug }
					disabledRestore={ ! allowRestore }
				/>
			</>
		);
	}

	renderFailedBackup( backup ) {
		const { translate, timezone, gmtOffset } = this.props;

		const backupTitleDate = this.getDisplayDate( backup.activityTs, false );
		const backupDate = applySiteOffset( backup.activityTs, { timezone, gmtOffset } );

		const displayDate = backupDate.format( 'L' );
		const displayTime = backupDate.format( 'LT' );

		return (
			<>
				<Gridicon icon="cloud-upload" className="daily-backup-status__gridicon-error-state" />
				<div className="daily-backup-status__failed-message">
					{ translate( 'Backup failed: %(backupDate)s', {
						args: { backupDate: backupTitleDate },
					} ) }
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
								'issue. View to get the issue resolved',
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
						href="https://jetpack.com/contact-support/"
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
		const { translate } = this.props;

		return (
			<>
				<Gridicon icon="cloud-upload" className="daily-backup-status__gridicon-no-backup" />

				<div className="daily-backup-status__date">
					{ translate( 'No backups are available yet.' ) }
				</div>

				<div className="daily-backup-status__unavailable">
					{ translate(
						'But don’t worry, one should become available in the next 24 hours. Contact support if you still need help.'
					) }
				</div>

				<Button
					className="daily-backup-status__support-button"
					href="https://jetpack.com/contact-support/"
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
		const { translate, selectedDate, siteSlug } = this.props;

		const displayDate = selectedDate.format( 'll' );
		const nextDate = selectedDate.clone().add( 1, 'days' );
		const displayNextDate = nextDate.format( 'll' );

		return (
			<>
				<Gridicon icon="cloud-upload" className="daily-backup-status__gridicon-no-backup" />
				<div className="daily-backup-status__title">{ translate( 'No backup' ) }</div>

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
					href="https://jetpack.com/contact-support/"
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

		return (
			<>
				<Gridicon className="daily-backup-status__gridicon-backup-scheduled" icon="cloud-upload" />
				<div className="daily-backup-status__static-title">
					{ translate( 'Backup Scheduled:' ) }
					<div>
						{ translate( 'In the next %d hour', 'In the next %d hours', {
							args: [ hoursForNextBackup ],
							count: hoursForNextBackup,
						} ) }
					</div>
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

	renderBackupStatus( backup ) {
		const { selectedDate, lastDateAvailable, moment, timezone, gmtOffset } = this.props;

		if ( backup ) {
			return isSuccessfulBackup( backup )
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

		const isToday = today.isSame( selectedDate, 'day' );
		if ( isToday ) {
			return this.renderNoBackupToday( lastDateAvailable );
		}

		return this.renderNoBackupOnDate();
	}

	render() {
		const backup = this.props.backup;

		return (
			<div className="daily-backup-status">
				<Card className="daily-backup-status__success">{ this.renderBackupStatus( backup ) }</Card>
			</div>
		);
	}
}

const ActionButtons = ( { disabledDownload, disabledRestore, rewindId, siteSlug } ) => {
	const translate = useTranslate();

	return (
		<>
			<Button
				className="daily-backup-status__download-button"
				href={ backupDownloadPath( siteSlug, rewindId ) }
				disabled={ disabledDownload }
				isPrimary={ false }
				onClick={ event => {
					disabledDownload && event.preventDefault();
				} }
			>
				{ translate( 'Download backup' ) }
			</Button>
			<Button
				className="daily-backup-status__restore-button"
				href={ backupRestorePath( siteSlug, rewindId ) }
				disabled={ disabledRestore }
				onClick={ event => {
					disabledRestore && event.preventDefault();
				} }
			>
				{ translate( 'Restore to this point' ) }
			</Button>
		</>
	);
};
ActionButtons.defaultProps = {
	disabledDownload: false,
	disabledRestore: false,
};

export default localize( withLocalizedMoment( DailyBackupStatus ) );
