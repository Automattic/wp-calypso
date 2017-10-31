/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import ProgressBar from 'components/progress-bar';
import QueryRewindRestoreStatus from 'components/data/query-rewind-restore-status';

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

function ProgressBanner( {
	applySiteOffset,
	moment,
	percent,
	status,
	siteId,
	timestamp,
	translate,
	freshness,
	restoreId,
} ) {
	const restoreStatusDescription =
		status === 'queued'
			? translate( 'Your restore will start in a moment.' )
			: translate( "We're on it! Your site is being restored." );

	return (
		<ActivityLogBanner status="info" title={ translate( 'Currently restoring your site' ) }>
			<QueryRewindRestoreStatus
				freshness={ freshness }
				queryDelay={ 1500 }
				restoreId={ restoreId }
				siteId={ siteId }
				timestamp={ timestamp }
			/>
			<p>
				{ translate(
					"We're in the process of restoring your site back to %s. " +
						"You'll be notified once it's complete.",
					{ args: applySiteOffset( moment.utc( ms( timestamp ) ) ).format( 'LLLL' ) }
				) }
			</p>

			<div>
				<em>{ restoreStatusDescription }</em>
				{ 'running' === status && <ProgressBar isPulsing value={ percent } /> }
			</div>
		</ActivityLogBanner>
	);
}

ProgressBanner.propTypes = {
	applySiteOffset: PropTypes.func.isRequired,
	percent: PropTypes.number.isRequired,
	siteId: PropTypes.number,
	status: PropTypes.oneOf( [ 'queued', 'running' ] ).isRequired,
	timestamp: PropTypes.string.isRequired,
};

export default localize( ProgressBanner );
