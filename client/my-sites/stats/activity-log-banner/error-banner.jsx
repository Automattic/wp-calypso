/** @format */
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
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import Gridicon from 'gridicons';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { dismissRewindRestoreProgress as dismissRewindRestoreProgressAction } from 'state/activity-log/actions';

class ErrorBanner extends PureComponent {
	static propTypes = {
		errorCode: PropTypes.string.isRequired,
		failureReason: PropTypes.string.isRequired,
		closeDialog: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.string,
		downloadId: PropTypes.number,
		requestedRestoreActivityId: PropTypes.string,
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
		requestedRestoreActivityId: undefined,
	};

	handleClickRestart = () => {
		const {
			siteId,
			downloadId,
			requestedRestoreActivityId,
			rewindRestore,
			createBackup,
		} = this.props;
		if ( downloadId ) {
			return createBackup( siteId, downloadId );
		}
		if ( requestedRestoreActivityId ) {
			return rewindRestore( siteId, requestedRestoreActivityId );
		}
	};

	handleDismiss = () =>
		isUndefined( this.props.downloadId )
			? this.props.closeDialog( 'restore' )
			: this.props.closeDialog( 'backup' );

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
					title: translate( 'Problem creating a backup' ),
					details: translate( 'We came across a problem creating a backup for your site.' ),
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
					className="activity-log-banner__error-happychat activity-log-confirm-dialog__more-info-link"
					onClick={ isUndefined( downloadId ) ? trackHappyChatRestore : trackHappyChatBackup }
				>
					<Gridicon icon="chat" />
					<span className="activity-log-banner__error-happychat-text activity-log-confirm-dialog__more-info-link-text">
						{ translate( 'Get help' ) }
					</span>
				</HappychatButton>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	dismissRewindRestoreProgress: dismissRewindRestoreProgressAction,
	trackHappyChatBackup: () => recordTracksEvent( 'calypso_activitylog_error_banner_backup' ),
	trackHappyChatRestore: () => recordTracksEvent( 'calypso_activitylog_error_banner_restore' ),
} )( localize( ErrorBanner ) );
