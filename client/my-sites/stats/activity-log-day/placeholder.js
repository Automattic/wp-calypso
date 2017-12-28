/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FoldableCard from 'client/components/foldable-card';

const component = (
	<FoldableCard
		className="activity-log-day__placeholder"
		header={
			<div>
				<div className="activity-log-day__day" />
				<div className="activity-log-day__events" />
			</div>
		}
	/>
);

export default function ActivityLogDayPlaceholder() {
	return component;
}
