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

/**
 * Style dependencies
 */
import './style.scss';

class DailyBackupStatus extends Component {
	createRestoreUrl = restoreId => `/backups/${ this.props.siteSlug }/restore/${ restoreId }`;

	triggerRestore = () => {
		const restoreId = this.props.backupAttempts.complete[ 0 ].rewindId;
		page.redirect( this.createRestoreUrl( restoreId ) );
	};

	renderGoodBackup() {
		const { allowRestore, backupAttempts, moment, translate } = this.props;

		const displayDate = moment( backupAttempts.complete[ 0 ].activityDate ).format(
			'MMMM Do YYYY, h:mm:ss a'
		);

		return (
			<Fragment>
				<Gridicon icon="cloud-upload" />
				<div className="daily-backup-status__label">
					{ translate( 'Latest backup completed:' ) }
				</div>
				<div className="daily-backup-status__date">{ displayDate }</div>
				<Button className="daily-backup-status__download-button">Download backup</Button>
				<Button
					className="daily-backup-status__restore-button"
					disabled={ ! allowRestore }
					onClick={ this.triggerRestore }
				>
					Restore to this point
				</Button>
			</Fragment>
		);
	}

	renderFailedBackup() {
		const { backupAttempts, translate } = this.props;

		const hasBackupError = backupAttempts.error.length;
		const errorMessage =
			hasBackupError && backupAttempts.error[ 0 ].activityDescription[ 0 ].children[ 0 ].text;

		return (
			<Fragment>
				<Gridicon icon="cross-circle" className="daily-backup-status__gridicon-error-state" />

				<div className="daily-backup-status__date">{ translate( 'Backup error' ) }</div>
				<div className="daily-backup-status__label">
					{ hasBackupError ? errorMessage : translate( 'This day has no backups.' ) }
				</div>
			</Fragment>
		);
	}

	render() {
		const { backupAttempts } = this.props;
		const dateHasGoodBackup = backupAttempts.complete.length;

		return (
			<div className="daily-backup-status">
				{ dateHasGoodBackup ? this.renderGoodBackup() : this.renderFailedBackup() }
			</div>
		);
	}
}

export default localize( withLocalizedMoment( DailyBackupStatus ) );
