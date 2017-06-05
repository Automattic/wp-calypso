/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './activity-log-banner';
import ProgressBar from 'components/progress-bar';

function SuccessBanner( {
	translate,
	moment,
} ) {
	// FIXME: real dates
	const date = 1496400468285;
	// FIXME: real progress
	const progress = 25;

	return (
		<ActivityLogBanner
			status="info"
			title={ translate( 'Currently restoring your site' ) }
		>
			<p>{ translate(
				'We\'re in the process of restoring your site back to %s.' +
				'You\'ll be notified once it\'s complete.',
				{ args: moment( date ).format( 'LLLL' ) }
			) }</p>

			<div>
				<em>{ translate( 'Currently restoring posts…' ) }</em>
				<ProgressBar value={ progress } isPulsing />
			</div>
		</ActivityLogBanner>
	);
}

export default localize( SuccessBanner );
