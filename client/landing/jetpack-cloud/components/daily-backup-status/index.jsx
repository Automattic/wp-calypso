/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import {
	isSuccessfulBackup,
	getRestorePath,
	getDownloadPath,
} from 'landing/jetpack-cloud/sections/backups/utils';
import { applySiteOffset } from 'lib/site/timezone';

/**
 * Style dependencies
 */
import './style.scss';

class DailyBackupStatus extends Component {
	triggerRestore = () => {
		page.redirect( getRestorePath( this.props.siteSlug, this.props.backup.rewindId ) );
	};

	triggerDownload = () => {
		page.redirect( getDownloadPath( this.props.siteSlug, this.props.backup.rewindId ) );
	};

	goToDetailsPage() {
		//page.redirect( '/backups/' + this.props.siteSlug + '/detail/' + this.props.backup.rewindId );
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
				translate( 'Latest' ) + ': ' + translate( 'Today' ) + ' ' + backupDate.format( 'LT' );
		} else {
			displayableDate = backupDate.format( dateFormat + ' LT' );
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
				<Button className="daily-backup-status__download-button" onClick={ this.triggerDownload }>
					{ translate( 'Download backup' ) }
				</Button>
				<Button
					className="daily-backup-status__restore-button"
					disabled={ ! allowRestore }
					onClick={ this.triggerRestore }
				>
					{ translate( 'Restore to this point' ) }
				</Button>
			</Fragment>
		);
	}

	renderFailedBackup( backup ) {
		const { translate, timezone, gmtOffset } = this.props;

		const backupTitleDate = this.getDisplayDate( backup.activityTs );
		const backupDate = applySiteOffset( backup.activityTs, { timezone, gmtOffset } );

		const displayDate = backupDate.format( 'L' );
		const displayTime = backupDate.format( 'LT' );

		return (
			<Fragment>
				<Gridicon icon="cross-circle" className="daily-backup-status__gridicon-error-state" />
				<div className="daily-backup-status__date">{ translate( 'Backup attempt failed' ) }</div>
				<div className="daily-backup-status__date">{ backupTitleDate }</div>
				<div className="daily-backup-status__label">
					<p>
						{ translate(
							'A backup for your site was attempted on %(displayDate) at %(displayTime) and was not able to be completed.',
							{ args: { displayDate, displayTime } }
						) }
					</p>
					<p>
						{ /* todo: Add the link of the guide: "backups help guide" */ }
						{ translate(
							'Check out the backups help guide or contact our support team to resolve the issue. View to get the issue resolved'
						) }
					</p>
					<Button className="daily-backup-status__download-button">
						{ translate( 'Contact support' ) }
					</Button>
				</div>
			</Fragment>
		);
	}

	renderNoBackups() {
		const { translate } = this.props;

		return (
			<Fragment>
				<Gridicon icon="sync" />

				<div className="daily-backup-status__date">Next backup at...</div>
				{ /* translate( 'This day has no backups.' ) */ }
				<Button className="daily-backup-status__download-button" disabled={ true }>
					{ translate( 'Download backup' ) }
				</Button>
				<Button className="daily-backup-status__restore-button" disabled={ true }>
					{ translate( 'Restore to this point' ) }
				</Button>

				<div>
					<strong>{ translate( 'Get Real-Time Backups' ) }</strong>
				</div>
				<div>
					{ /* todo: add a link to the page for the upgrade: "Upgrade to real-time backups" */ }
					{ translate(
						'Upgrade to real-time backups to have your work saved, in real-time as you make changes.'
					) }
				</div>
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

export default localize( withLocalizedMoment( DailyBackupStatus ) );
