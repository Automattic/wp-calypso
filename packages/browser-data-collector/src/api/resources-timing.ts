export const getResources = (): PerformanceResourceTiming[] =>
	( window?.performance?.getEntriesByType( 'resource' ) as PerformanceResourceTiming[] ) || [];
