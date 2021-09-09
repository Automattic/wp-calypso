export function siteObjectsToSiteIds( sites ) {
	return sites?.map( ( site ) => site.ID ) ?? [];
}

export function getVisibleSites( sites ) {
	return sites?.filter( ( site ) => site.visible );
}
