export const useGlobalSidebar = ( siteId, sectionGroup ) => {
	// TODO: need to expand on logic here - could add feature flag or some environment variable to control this
	const shouldShowGlobalSidebar =
		sectionGroup === 'me' ||
		sectionGroup === 'reader' ||
		sectionGroup === 'sites-dashboard' ||
		( sectionGroup === 'sites' && ! siteId );
	return { shouldShowGlobalSidebar };
};
