export const getMarks = (): PerformanceEntry[] =>
	( window?.performance?.getEntriesByType( 'mark' ) as PerformanceEntry[] ) || [];

export const getMeasures = (): PerformanceEntry[] =>
	( window?.performance?.getEntriesByType( 'measure' ) as PerformanceEntry[] ) || [];
