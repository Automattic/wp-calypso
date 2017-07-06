/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import ProgressBar from 'components/progress-bar';

function ProgressBanner( {
	moment,
	percent,
	status,
	timestamp,
	translate,
} ) {
	const restoreStatusDescription = status === 'queued'
		? translate( 'Hold tight, your restore will begin soon.' )
		: translate( 'Sit back and relax, your site is currently being restored.' );

	return (
		<ActivityLogBanner
			status="info"
			title={ translate( 'Currently restoring your site' ) }
		>
			<p>{ translate(
				"We're in the process of restoring your site back to %s. " +
				"You'll be notified once it's complete.",
				{ args: moment( timestamp ).format( 'LLLL' ) }
			) }</p>

			<div>
				<em>{ restoreStatusDescription }</em>
				<ProgressBar
					className={
						status === 'queued'
							? 'activity-log-banner__progress-bar--queued'
							: null
					}
					isPulsing
					value={ status === 'queued' ? 100 : percent }
				/>
			</div>
		</ActivityLogBanner>
	);
}

ProgressBanner.propTypes = {
	percent: PropTypes.number.isRequired,
	status: PropTypes.oneOf( [
		'queued',
		'running',
	] ).isRequired,
	timestamp: PropTypes.number.isRequired,
};

export default localize( ProgressBanner );
