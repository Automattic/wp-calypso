export const getSiteProfilerReport = ( state, siteId ) => state.siteProfiler.report[ siteId ];
export const getSiteProfilerReportStep = ( state, siteId, pageId ) =>
	state.siteProfiler.step[ siteId ]?.[ pageId ];
