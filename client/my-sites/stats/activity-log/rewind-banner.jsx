/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from 'my-sites/stats/activity-log-banner';
import Button from 'components/button';
import Gridicon from 'gridicons';
import HappychatButton from 'components/happychat/button';
import ProgressBar from 'components/progress-bar';
import TrackComponentView from 'lib/analytics/track-component-view';
import { getRewindState, getSiteUrl } from 'state/selectors';
import { dismissRewindRestoreProgress } from 'state/activity-log/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { rewindRestore } from '../../../state/activity-log/actions';
import { withAnalytics } from '../../../state/analytics/actions';

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

export class RewindBanner extends Component {
	retry = () => this.props.rewindRestore( this.props.rewind.rewindId );

	render() {
		const { applySiteOffset, moment, rewind, siteUrl, translate } = this.props;
		if ( ! rewind ) {
			return null;
		}

		const { status, rewindId } = rewind;
		const rewindTo = applySiteOffset( moment.utc( ms( rewindId ) ) ).format( 'LLLL' );

		switch ( status ) {
			case 'queued':
			case 'running':
				const { progress } = rewind;
				return (
					<ActivityLogBanner status="info" title={ translate( 'Currently restoring your site' ) }>
						<div>
							<p>
								{ translate(
									"We're in the process of restoring your site back to %s. " +
										"You'll be notified once it's complete.",
									{ args: rewindTo }
								) }
							</p>
							<em>
								{ 'queued' === status
									? translate( 'Your restore will start in a moment.' )
									: translate( "We're on it! Your site is being restored." ) }
							</em>
						</div>
						{ ( 'running' === status || ( 0 <= progress && progress <= 100 ) ) && (
							<ProgressBar isPulsing value={ progress || 0 } />
						) }
					</ActivityLogBanner>
				);

			case 'finished':
				return (
					<ActivityLogBanner
						isDismissable
						onDismissClick={ this.props.dismiss }
						status="success"
						title={ translate( 'Your site has been successfully restored' ) }
						icon="history"
					>
						<TrackComponentView
							eventName="calypso_activitylog_restore_successbanner_impression"
							eventProperties={ { restore_to: rewindId } }
						/>
						<p>
							{ translate( 'We successfully restored your site back to %s!', {
								args: rewindTo,
							} ) }
						</p>
						<Button href={ siteUrl } primary>
							{ translate( 'View site' ) }
						</Button>
						<Button className="activity-log-banner__success-gotit" onClick={ this.props.dismiss }>
							{ translate( 'Thanks, got it!' ) }
						</Button>
						<HappychatButton
							className="activity-log-banner__success-happychat activity-log-confirm-dialog__more-info-link"
							onClick={ this.props.trackHappyChat }
						>
							<Gridicon icon="chat" />
							<span className="activity-log-banner__success-happychat-text activity-log-confirm-dialog__more-info-link-text">
								{ translate( 'Get help' ) }
							</span>
						</HappychatButton>
					</ActivityLogBanner>
				);

			case 'failed':
				return (
					<ActivityLogBanner
						isDismissable
						onDismissClick={ this.props.dismiss }
						status="error"
						title={ translate( 'Problem restoring your site' ) }
					>
						<TrackComponentView
							eventName="calypso_activitylog_errorbanner_impression"
							eventProperties={ {
								failure_reason: rewind.reason,
								restore_to: rewindId,
							} }
						/>
						<p>{ translate( 'We came across a problem while trying to restore your site.' ) }</p>
						<Button primary onClick={ this.retry }>
							{ translate( 'Try again' ) }
						</Button>
						<HappychatButton
							className="activity-log-banner__error-happychat activity-log-confirm-dialog__more-info-link"
							onClick={ this.props.trackHappyChatRestore }
						>
							<Gridicon icon="chat" />
							<span className="activity-log-banner__error-happychat-text activity-log-confirm-dialog__more-info-link-text">
								{ translate( 'Get help' ) }
							</span>
						</HappychatButton>
					</ActivityLogBanner>
				);

			default:
				return null;
		}
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	rewind: getRewindState( state, siteId ).rewind,
	siteUrl: getSiteUrl( state, siteId ),
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	dismiss: () => dispatch( dismissRewindRestoreProgress( siteId ) ),
	rewindRestore: rewindId =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_confirm', { actionId: rewindId } ),
				rewindRestore( siteId, rewindId )
			)
		),
	trackHappyChat: () =>
		dispatch( recordTracksEvent( 'calypso_activitylog_success_banner_restore' ) ),
	trackHappyChatRestore: () =>
		dispatch( recordTracksEvent( 'calypso_activitylog_error_banner_restore' ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( RewindBanner ) );
