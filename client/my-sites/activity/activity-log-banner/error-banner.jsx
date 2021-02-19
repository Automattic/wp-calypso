/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import { Button } from '@automattic/components';
import HappychatButton from 'calypso/components/happychat/button';
import Gridicon from 'calypso/components/gridicon';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	dismissRewindBackupProgress,
	dismissRewindRestoreProgress as dismissRewindRestoreProgressAction,
} from 'calypso/state/activity-log/actions';

class ErrorBanner extends PureComponent {
	static propTypes = {
		errorCode: PropTypes.string.isRequired,
		failureReason: PropTypes.string.isRequired,
		closeDialog: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.string,
		downloadId: PropTypes.number,
		requestedRestoreId: PropTypes.string,
		createBackup: PropTypes.func,
		rewindRestore: PropTypes.func,

		// connect
		dismissRewindRestoreProgress: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		errorCode: '',
		failureReason: '',
		downloadId: undefined,
		requestedRestoreId: undefined,
	};

	handleClickRestart = () => {
		const { siteId, downloadId, requestedRestoreId, rewindRestore, createBackup } = this.props;
		if ( downloadId ) {
			return createBackup( siteId, downloadId );
		}
		if ( requestedRestoreId ) {
			return rewindRestore( siteId, requestedRestoreId );
		}
	};

	handleDismiss = () =>
		isUndefined( this.props.downloadId )
			? this.props.closeDialog( 'restore' )
			: this.props.dismissDownloadError( this.props.siteId, this.props.downloadId );

	render() {
		const {
			errorCode,
			failureReason,
			timestamp,
			translate,
			downloadId,
			trackHappyChatBackup,
			trackHappyChatRestore,
		} = this.props;
		const strings = isUndefined( downloadId )
			? {
					title: translate( 'Problem restoring your site' ),
					details: translate( 'We came across a problem while trying to restore your site.' ),
			  }
			: {
					title: translate( 'Problem preparing your file' ),
					details: translate( 'There was a problem preparing your backup for downloading.' ),
			  };

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="error"
				title={ strings.title }
			>
				<TrackComponentView
					eventName="calypso_activitylog_errorbanner_impression"
					eventProperties={
						isUndefined( downloadId )
							? {
									error_code: errorCode,
									failure_reason: failureReason,
									restore_to: timestamp,
							  }
							: {
									error_code: 'backup',
									failure_reason: 'backup failed',
									download_id: downloadId,
							  }
					}
				/>
				<p>{ strings.details }</p>
				<Button primary onClick={ this.handleClickRestart }>
					{ translate( 'Try again' ) }
				</Button>
				<HappychatButton
					className="activity-log-banner__happychat-button"
					onClick={ isUndefined( downloadId ) ? trackHappyChatRestore : trackHappyChatBackup }
				>
					<Gridicon icon="chat" />
					<span>{ translate( 'Get help' ) }</span>
				</HappychatButton>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	dismissRewindRestoreProgress: dismissRewindRestoreProgressAction,
	dismissDownloadError: dismissRewindBackupProgress,
	trackHappyChatBackup: () => recordTracksEvent( 'calypso_activitylog_error_banner_backup' ),
	trackHappyChatRestore: () => recordTracksEvent( 'calypso_activitylog_error_banner_restore' ),
} )( localize( ErrorBanner ) );
