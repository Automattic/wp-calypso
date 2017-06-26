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

function SuccessBanner( {
	moment,
	percent,
	status,
	timestamp,
	translate,
} ) {
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
				<em>{
					/*
					* FIXME: Do we have a detailed message or should this be removed?
					* FIXME: Show a message for `queued` status before progress?
					* */
					translate( 'Currently restoring posts…' )
				}</em>
				<ProgressBar value={ percent } isPulsing={ status === 'running' } />
			</div>
		</ActivityLogBanner>
	);
}

SuccessBanner.propTypes = {
	percent: PropTypes.number.isRequired,
	status: PropTypes.oneOf( [
		'queued',
		'running',
	] ).isRequired,
	timestamp: PropTypes.number.isRequired,
};

export default localize( SuccessBanner );
