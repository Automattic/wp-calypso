/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize, useTranslate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { isSuccessfulBackup } from 'landing/jetpack-cloud/sections/backups/utils';
import {
	/*backupsDetail,*/ backupsDownload,
	backupsRestore,
} from 'landing/jetpack-cloud/sections/backups/paths';
import { applySiteOffset } from 'lib/site/timezone';

/**
 * Style dependencies
 */
import './style.scss';

class DailyBackupStatus extends Component {
	triggerRestore = () => {
		page.redirect( backupsRestore( this.props.siteSlug, this.props.backup.rewindId ) );
	};

	triggerDownload = () => {
		page.redirect( backupsDownload( this.props.siteSlug, this.props.backup.rewindId ) );
	};

	goToDetailsPage() {
		//page.redirect( backupsDetail( this.props.siteSlug, this.props.backup.rewindId ) );
	}

	getDisplayDate = date => {
		const { translate, moment, timezone, gmtOffset } = this.props;

		//Apply the time offset
		const backupDate = applySiteOffset( moment( date ), { timezone, gmtOffset } );
		const today = applySiteOffset( moment(), { timezone, gmtOffset } );

		const isToday = today.isSame( backupDate, 'day' );
		const yearToday = today.format( 'YYYY' );
		const yearDate = backupDate.format( 'YYYY' );

		const dateFormat = yearToday === yearDate ? 'MMM D' : 'MMM D, YYYY';

		let displayableDate;

		if ( isToday ) {
			displayableDate =
				translate( 'Latest' ) + ': ' + translate( 'Today' ) + ' ' + backupDate.format( 'H:mm' );
		} else {
			displayableDate = backupDate.format( dateFormat + ' H:mm' );
		}

		return displayableDate;
	};

	renderGoodBackup( backup ) {
		const { allowRestore, translate } = this.props;

		const displayDate = this.getDisplayDate( backup.activityTs );

		return (
			<Fragment>
				<Gridicon className="daily-backup-status__status-icon" icon="cloud-upload" />
				<div className="daily-backup-status__label">
					{ translate( 'Latest backup completed:' ) }
				</div>
				<div className="daily-backup-status__date">{ displayDate }</div>
				<ActionButtons
					onDownloadClick={ this.triggerDownload }
					onRestoreClick={ this.triggerRestore }
					disabledRestore={ ! allowRestore }
				/>
			</Fragment>
		);
	}

	renderFailedBackup( backup ) {
		const { translate, timezone, gmtOffset } = this.props;

		const backupTitleDate = this.getDisplayDate( backup.activityTs );
		const backupDate = applySiteOffset( backup.activityTs, { timezone, gmtOffset } );

		const displayDate = backupDate.format( 'L' );
		const displayTime = backupDate.format( 'H:mm' );

		return (
			<Fragment>
				<Gridicon icon="cross-circle" className="daily-backup-status__gridicon-error-state" />
				<div className="daily-backup-status__date">{ translate( 'Backup attempt failed' ) }</div>
				<div className="daily-backup-status__date">{ backupTitleDate }</div>
				<div className="daily-backup-status__label">
					<p>
						{ translate(
							'A backup for your site was attempted on %(displayDate)s at %(displayTime)s and was not able to be completed.',
							{ args: { displayDate, displayTime } }
						) }
					</p>
					<p>
						{ translate(
							'Check out the {{a}}backups help guide{{/a}} or contact our support team to resolve the issue. View to get the issue resolved',
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
						className="daily-backup-status__download-button"
						href="https://jetpack.com/contact-support/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{ translate( 'Contact support' ) }
					</Button>
				</div>
			</Fragment>
		);
	}

	renderNoBackups() {
		const { translate } = this.props;

		// todo: remove the mock dates by the real dates
		const lastBackupAt = 'Yesterday 16:02';
		const nextBackupAt = 'Today 16:02';

		return (
			<Fragment>
				<Gridicon icon="sync" />

				<div className="daily-backup-status__date">
					{ translate( 'Backup Scheduled' ) }: { nextBackupAt }
				</div>
				<div>{ translate( 'Last daily backup' ) + ` ${ lastBackupAt }` }</div>

				<ActionButtons disabledDownload={ true } disabledRestore={ true } />
			</Fragment>
		);
	}

	renderBackupStatus( backup ) {
		if ( ! backup ) {
			return this.renderNoBackups();
		} else if ( isSuccessfulBackup( backup ) ) {
			return this.renderGoodBackup( backup );
		}

		return this.renderFailedBackup( backup );
	}

	render() {
		const backup = this.props.backup;

		return <div className="daily-backup-status">{ this.renderBackupStatus( backup ) }</div>;
	}
}

const ActionButtons = ( {
	disabledDownload,
	disabledRestore,
	onDownloadClick,
	onRestoreClick,
} ) => {
	const translate = useTranslate();

	return (
		<>
			<Button
				className="daily-backup-status__download-button"
				onClick={ onDownloadClick }
				disabled={ disabledDownload }
			>
				{ translate( 'Download backup' ) }
			</Button>
			<Button
				className="daily-backup-status__restore-button"
				disabled={ disabledRestore }
				onClick={ onRestoreClick }
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
