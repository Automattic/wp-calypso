/**
 * Internal dependencies
 */
import { startPerformanceTracking } from './lib';

export const performanceTrackerStart = ( pageName ) => {
	return ( context, next ) => {
		startPerformanceTracking( pageName, context.init ?? false );
		next();
	};
};
