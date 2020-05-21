/**
 * External dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { PerformanceTrackerStop } from './performance-tracker-stop';

export const withPerformanceTrackerStop = createHigherOrderComponent( ( Wrapped ) => {
	return function WithPerformanceTrackerStop( props ) {
		return (
			<>
				<Wrapped { ...props } />
				<PerformanceTrackerStop />
			</>
		);
	};
}, 'WithPerformanceTrackerStop' );
