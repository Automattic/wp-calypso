export const getSiteProfilerReport = ( state, siteId, pageId ) =>
	state.siteProfiler?.report?.[ siteId ]?.[ pageId ];
