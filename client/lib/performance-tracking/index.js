/**
 * External dependencies
 */
import { startNavigation } from './api';

export const trackNavigationStart = ( pageName ) => {
	return ( context, next ) => {
		startNavigation( {
			label: pageName || 'calypso',
			metadata: {
				init: context.init || false,
			},
		} );
		next();
	};
};

export { default as PerformanceTrackerInstall } from './components/performance-tracker-install';
export { default as PerformanceTrackerStop } from './components/performance-tracker-stop';
