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
					{ args: applySiteOffset( moment.utc( timestamp ) ).format( 'LLLL' ) }
				) }
			</p>

			<div>
				<em>{ restoreStatusDescription }</em>
				<ProgressBar
					className={ status === 'queued' ? 'activity-log-banner__progress-bar--queued' : null }
					isPulsing
					value={ status === 'queued' ? 100 : percent }
				/>
			</div>
		</ActivityLogBanner>
	);
}

ProgressBanner.propTypes = {
	applySiteOffset: PropTypes.func.isRequired,
	percent: PropTypes.number.isRequired,
	siteId: PropTypes.number,
	status: PropTypes.oneOf( [ 'queued', 'running' ] ).isRequired,
	timestamp: PropTypes.number.isRequired,
};

export default localize( ProgressBanner );
