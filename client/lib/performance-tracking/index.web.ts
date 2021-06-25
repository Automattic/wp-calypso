export { performanceTrackerStart } from './performance-tracker-start';

export { usePerformanceTrackerStop } from './use-performance-tracker-stop';
export { withPerformanceTrackerStop } from './with-performance-tracker-stop';
export { withStopPerformanceTrackingProp } from './with-stop-performance-tracking-prop';
export { default as PerformanceTrackerStop } from './performance-tracker-stop';

export type PerformanceTrackProps = {
	stopPerformanceTracking: ( metadata?: { [ key: string ]: string | boolean | number } ) => void;
};
