import { usePerformanceTrackerStop } from './use-performance-tracker-stop';

const DEFAULT_EXTRA_COLLECTORS = [];

const PerformanceTrackerStop = ( { extraCollectors = DEFAULT_EXTRA_COLLECTORS } ) => {
	usePerformanceTrackerStop( extraCollectors );

	// Nothing to render, this component is all about side effects
	return null;
};

export default PerformanceTrackerStop;
