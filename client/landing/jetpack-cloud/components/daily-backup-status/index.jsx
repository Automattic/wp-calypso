/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { applySiteOffset } from 'lib/site/timezone';

/**
 * Style dependencies
 */
import './style.scss';

class DailyBackupStatus extends Component {
	static propTypes = {
		selectedDate: PropTypes.instanceOf( Date ).isRequired,
		backups: PropTypes.array,
		siteSlug: PropTypes.string.isRequired,
		siteGmtOffset: PropTypes.number,
		siteTimezone: PropTypes.string,
	};

	createRestoreUrl = restoreId => `/backups/${ this.props.siteSlug }/restore/${ restoreId }`;

	triggerRestore = rewindId => {
		// const restoreId = this.props.backupAttempts.complete[ 0 ].rewindId;
		page.redirect( this.createRestoreUrl( rewindId ) );
	};

	getDisplayDate = date => {
		const { translate, moment, siteTimezone, siteGmtOffset } = this.props;

		const backupDate = applySiteOffset( moment( date ), { siteTimezone, siteGmtOffset } );
		const today = applySiteOffset( moment(), { siteTimezone, siteGmtOffset } );

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
		//const { allowRestore, backupAttempts, moment, translate } = this.props;
		const { translate } = this.props;

		return (
			<Fragment>
				<Gridicon icon="cloud-upload" />
				<div className="daily-backup-status__label">
					{ translate( 'Latest backup completed:' ) }
				</div>
				<div className="daily-backup-status__date">
					{ this.getDisplayDate( backup.activityTs ) }
				</div>
				<Button className="daily-backup-status__download-button">Download backup</Button>
				<Button
					className="daily-backup-status__restore-button"
					// disabled={ ! allowRestore }
					onClick={ () => this.triggerRestore( backup.rewindId ) }
				>
					Restore to this point
				</Button>
			</Fragment>
		);
	}

	renderFailedBackup( backup ) {
		const { translate } = this.props;
		// const { backupAttempts, translate } = this.props;
		//
		// const hasBackupError = backupAttempts.error.length;
		// const errorMessage =
		// 	hasBackupError && backupAttempts.error[ 0 ].activityDescription[ 0 ].children[ 0 ].text;

		return (
			<Fragment>
				<Gridicon icon="cross-circle" className="daily-backup-status__gridicon-error-state" />

				<div className="daily-backup-status__date">{ translate( 'Backup error' ) }</div>
				<div className="daily-backup-status__date">
					{ this.getDisplayDate( backup.activityTs ) }
				</div>
				{ /*<div className="daily-backup-status__label">*/ }
				{ /*{ hasBackupError ? errorMessage : translate( 'This day has no backups.' ) }*/ }
				{ /*</div>*/ }
			</Fragment>
		);
	}

	renderNoBackups() {
		const { translate } = this.props;

		//todo: update this view to a warning message with the next backup expected time
		return (
			<Fragment>
				<Gridicon icon="cross-circle" className="daily-backup-status__gridicon-error-state" />

				<div className="daily-backup-status__date">{ translate( 'Backup error' ) }</div>
				{ /*<div className="daily-backup-status__label">*/ }
				{ /*{ hasBackupError ? errorMessage : translate( 'This day has no backups.' ) }*/ }
				{ /*</div>*/ }
			</Fragment>
		);
	}

	renderBackupStatus() {
		const { backups } = this.props;

		//Note: The first backup in the list is the last one in the day

		// There aren't backups
		if ( 0 === backups.length ) {
			return this.renderNoBackups();
		}

		// We have backups, we take the most recent full backup
		const recentBackup = backups[ 0 ];

		if ( 'success' === recentBackup.activityStatus && recentBackup.activityIsRewindable ) {
			return this.renderGoodBackup( recentBackup );
		}

		// if( 'error' === backups[0].activityStatus ) {
		// 	return this.renderFailedBackup();
		// }

		return this.renderFailedBackup( recentBackup );
	}

	renderBackupDetailsSummary() {}

	render() {
		// const { backupAttempts } = this.props;
		// const dateHasGoodBackup = backupAttempts.complete.length;

		return (
			<>
				<div className="daily-backup-status">{ this.renderBackupStatus() }</div>
				<div>{ /*{ this.renderBackupDetailsSummary() }*/ }</div>
			</>
		);
	}
}

export default localize( withLocalizedMoment( DailyBackupStatus ) );
