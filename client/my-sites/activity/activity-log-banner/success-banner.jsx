/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import { withLocalizedMoment } from 'components/localized-moment';
import { Button } from '@automattic/components';
import HappychatButton from 'components/happychat/button';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import getSiteUrl from 'state/selectors/get-site-url';
import {
	dismissRewindRestoreProgress,
	dismissRewindBackupProgress,
} from 'state/activity-log/actions';

/**
 * Style dependencies
 */
import './success-banner.scss';

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
 * @param {number} ts timestamp in 's' or 'ms'
 * @returns {number} timestamp in 'ms'
 */
const ms = ( ts ) =>
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
		context: PropTypes.string,

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
			: this.props.dismissRestoreProgress( this.props.siteId, this.props.restoreId );

	trackDownload = () =>
		this.props.recordTracksEvent( 'calypso_activitylog_backup_download', {
			download_count: this.props.downloadCount,
		} );

	render() {
		const {
			applySiteOffset,
			moment,
			siteUrl,
			timestamp,
			translate,
			backupUrl,
			context,
			trackHappyChatBackup,
			trackHappyChatRestore,
		} = this.props;
		const date = applySiteOffset( moment( ms( timestamp ) ) ).format( 'LLLL' );
		const params = backupUrl
			? {
					title: translate( 'Your backup is now available for download' ),
					icon: 'cloud-download',
					track: (
						<TrackComponentView eventName="calypso_activitylog_backup_successbanner_impression" />
					),
					taskFinished: translate(
						'We successfully created a backup of your site as of %(date)s!',
						{
							args: { date },
						}
					),
					actionButton: (
						<Button href={ backupUrl } onClick={ this.trackDownload } primary>
							{ translate( 'Download' ) }
						</Button>
					),
					trackHappyChat: trackHappyChatBackup,
			  }
			: {
					title:
						'alternate' === context
							? translate( 'Your site has been successfully cloned' )
							: translate( 'Your site has been successfully restored' ),
					icon: 'history',
					track: (
						<TrackComponentView
							eventName="calypso_activitylog_restore_successbanner_impression"
							eventProperties={ { restore_to: timestamp } }
						/>
					),
					taskFinished:
						'alternate' === context
							? translate( 'We successfully cloned your site to the state as of %(date)s!', {
									args: { date },
							  } )
							: translate( 'We successfully restored your site back to %(date)s!', {
									args: { date },
							  } ),
					actionButton: (
						<Button href={ siteUrl } primary>
							{ translate( 'View site' ) }
						</Button>
					),
					trackHappyChat: trackHappyChatRestore,
			  };
		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="success"
				title={ params.title }
				icon={ params.icon }
			>
				{ params.track }
				<p>{ params.taskFinished }</p>
				{ params.actionButton }
				{ ! backupUrl && (
					<Button className="activity-log-banner__success-gotit" onClick={ this.handleDismiss }>
						{ translate( 'Thanks, got it!' ) }
					</Button>
				) }
				<HappychatButton
					className="activity-log-banner__happychat-button"
					onClick={ params.trackHappyChat }
				>
					<Gridicon icon="chat" />
					<span>{ translate( 'Get help' ) }</span>
				</HappychatButton>
			</ActivityLogBanner>
		);
	}
}

export default compose(
	connect(
		( state, { siteId } ) => ( {
			siteUrl: getSiteUrl( state, siteId ),
		} ),
		{
			dismissRestoreProgress: dismissRewindRestoreProgress,
			dismissBackupProgress: dismissRewindBackupProgress,
			recordTracksEvent: recordTracksEvent,
			trackHappyChatBackup: () => recordTracksEvent( 'calypso_activitylog_success_banner_backup' ),
			trackHappyChatRestore: () =>
				recordTracksEvent( 'calypso_activitylog_success_banner_restore' ),
		}
	),
	localize,
	withLocalizedMoment
)( SuccessBanner );
