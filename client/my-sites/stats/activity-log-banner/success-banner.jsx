/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import Gridicon from 'gridicons';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { dismissRewindBackupProgress } from 'state/activity-log/actions';

/**
 * Normalize timestamp values
 *
 * Some timestamps are in seconds instead
 * of in milliseconds and this will make
 * sure they are all reported in ms
 *
 * The chosen comparison date is older than
 * WordPress so no backups should already
 * exist prior to that date 😉
 *
 * @param {Number} ts timestamp in 's' or 'ms'
 * @returns {Number} timestamp in 'ms'
 */
const ms = ts =>
	ts < 946702800000 // Jan 1, 2001 @ 00:00:00
		? ts * 1000 // convert s -> ms
		: ts;

class SuccessBanner extends PureComponent {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.string,
		backupUrl: PropTypes.string,
		downloadCount: PropTypes.number,
		downloadId: PropTypes.number,

		// connect
		dismissBackupProgress: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleDismiss = () =>
		this.props.dismissBackupProgress( this.props.siteId, this.props.downloadId );

	trackDownload = () =>
		this.props.recordTracksEvent( 'calypso_activitylog_backup_download', {
			download_count: this.props.downloadCount,
		} );

	render() {
		const {
			applySiteOffset,
			moment,
			timestamp,
			translate,
			backupUrl,
			trackHappyChatBackup,
		} = this.props;

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="success"
				title={ translate( 'Your backup is now available for download' ) }
				icon="cloud-download"
			>
				<TrackComponentView eventName="calypso_activitylog_backup_successbanner_impression" />
				<p>
					{ translate( 'We successfully created a backup of your site to %s!', {
						args: applySiteOffset( moment.utc( ms( timestamp ) ) ).format( 'LLLL' ),
					} ) }
				</p>
				<Button href={ backupUrl } onClick={ this.trackDownload } primary>
					{ translate( 'Download' ) }
				</Button>
				<HappychatButton
					className="activity-log-banner__success-happychat activity-log-confirm-dialog__more-info-link"
					onClick={ trackHappyChatBackup }
				>
					<Gridicon icon="chat" />
					<span className="activity-log-banner__success-happychat-text activity-log-confirm-dialog__more-info-link-text">
						{ translate( 'Get help' ) }
					</span>
				</HappychatButton>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	dismissBackupProgress: dismissRewindBackupProgress,
	recordTracksEvent: recordTracksEvent,
	trackHappyChatBackup: () => recordTracksEvent( 'calypso_activitylog_success_banner_backup' ),
	trackHappyChatRestore: () => recordTracksEvent( 'calypso_activitylog_success_banner_restore' ),
} )( localize( SuccessBanner ) );
