/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

class DailyBackupStatus extends Component {
	renderGoodBackup() {
		const { backupAttempts, moment, translate } = this.props;

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
