import { createHigherOrderComponent } from '@wordpress/compose';
import PerformanceTrackerStop from './performance-tracker-stop';

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
