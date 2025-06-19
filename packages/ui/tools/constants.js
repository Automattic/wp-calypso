/**
 * These entrypoints are the source of truth for our build
 * and also for the exports in package.json
 */
export const entrypoints = {
	// The paths are relative to the "src" directory
	'.': 'index.ts',
	badge: 'badge/index.tsx',
	calendar: 'calendar/index.tsx',
};
