/**
 * Internal dependencies
 */
import { usePerformanceTrackerStop } from './use-performance-tracker-stop';

const PerformanceTrackerStop = () => {
	usePerformanceTrackerStop();

	// Nothing to render, this component is all about side effects
	return null;
};

export default PerformanceTrackerStop;
