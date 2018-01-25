/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from 'my-sites/stats/activity-log-banner';
import ProgressBar from 'components/progress-bar';
import { getRewindState } from 'state/selectors';

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

function RewindProgressBanner( {
	applySiteOffset,
	moment,
	percent,
	status,
	timestamp,
	translate,
} ) {
	return (
		<ActivityLogBanner status="info" title={ translate( 'Currently restoring your site' ) }>
			<div>
				<p>
					{ translate(
						"We're in the process of restoring your site back to %s. " +
							"You'll be notified once it's complete.",
						{ args: applySiteOffset( moment.utc( ms( timestamp ) ) ).format( 'LLLL' ) }
					) }
				</p>
				<em>
					{ 'queued' === status
						? translate( 'Your restore will start in a moment.' )
						: translate( "We're on it! Your site is being restored." ) }
				</em>
			</div>
			{ 'running' === status && <ProgressBar isPulsing value={ percent || 0 } /> }
		</ActivityLogBanner>
	);
}

const mapStateToProps = ( state, { siteId } ) => {
	const { rewind = {} } = getRewindState( state, siteId );

	return {
		percent: rewind.progress,
		restoreId: rewind.rewindId,
		status: rewind.status,
	};
};

export default connect( mapStateToProps )( localize( RewindProgressBanner ) );
