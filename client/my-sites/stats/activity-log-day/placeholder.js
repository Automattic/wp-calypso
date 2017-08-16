/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';

function ActivityLogDayPlaceholder( { translate } ) {
	return (
		<FoldableCard
			className="activity-log-day__placeholder"
			header={
				<div>
					<div className="activity-log-day__day">
						{ translate( 'Loading…' ) }
					</div>
					<div className="activity-log-day__events">
						{ translate( 'Loading…' ) }
					</div>
				</div>
			}
		/>
	);
}

export default localize( ActivityLogDayPlaceholder );
