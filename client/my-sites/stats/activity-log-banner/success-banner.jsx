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
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteUrl } from 'state/selectors';
import {
	dismissRewindRestoreProgress,
	dismissRewindBackupProgress,
} from 'state/activity-log/actions';

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
		siteUrl: PropTypes.string.isRequired,
		timestamp: PropTypes.string,
		backupUrl: PropTypes.string,
		downloadCount: PropTypes.number,
		downloadId: PropTypes.number,

		// connect
		dismissRestoreProgress: PropTypes.func.isRequired,
		dismissBackupProgress: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleDismiss = () =>
		this.props.backupUrl
			? this.props.dismissBackupProgress( this.props.siteId, this.props.downloadId )
			: this.props.dismissRestoreProgress( this.props.siteId );

	trackDownload = () =>
		this.props.recordTracksEvent( 'calypso_activitylog_backup_download', {
			downloadCount: this.props.downloadCount,
		} );

	render() {
		const { applySiteOffset, moment, siteUrl, timestamp, translate, backupUrl } = this.props;
		const date = applySiteOffset( moment.utc( ms( timestamp ) ) ).format( 'LLLL' );
		const params = backupUrl
			? {
					title: translate( 'Your backup is now available for download' ),
					icon: 'cloud-download',
				}
			: {
					title: translate( 'Your site has been successfully restored' ),
					icon: 'history',
				};
		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="success"
				title={ params.title }
				icon={ params.icon }
			>
				{ backupUrl ? (
					<TrackComponentView eventName="calypso_activitylog_backup_successbanner_impression" />
				) : (
					<TrackComponentView
						eventName="calypso_activitylog_restore_successbanner_impression"
						eventProperties={ {
							restore_to: timestamp,
						} }
					/>
				) }
				{
					<p>
						{ backupUrl
							? translate( 'We successfully created a backup of your site to %s!', { args: date } )
							: translate( 'We successfully restored your site back to %s!', { args: date } ) }
					</p>
				}
				{ backupUrl ? (
					<Button href={ backupUrl } onClick={ this.trackDownload } primary>
						{ translate( 'Download' ) }
					</Button>
				) : (
					<Button href={ siteUrl } primary>
						{ translate( 'View site' ) }
					</Button>
				) }
				{ '  ' }
				{ ! backupUrl && (
					<Button onClick={ this.handleDismiss }>{ translate( 'Thanks, got it!' ) }</Button>
				) }
			</ActivityLogBanner>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteUrl: getSiteUrl( state, siteId ),
	} ),
	{
		dismissRestoreProgress: dismissRewindRestoreProgress,
		dismissBackupProgress: dismissRewindBackupProgress,
		recordTracksEvent: recordTracksEvent,
	}
)( localize( SuccessBanner ) );
