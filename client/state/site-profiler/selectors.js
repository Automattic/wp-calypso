export const getSiteProfilerReport = ( state, siteId, pageId ) =>
	state.siteProfiler?.report?.[ siteId ]?.[ pageId ];
export const getSiteProfilerLastVisitedReport = ( state, siteId ) =>
	state.siteProfiler?.lastVisitedReport?.[ siteId ];
