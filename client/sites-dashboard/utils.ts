export const getDashboardUrl = ( slug: string ) => {
	return '/home/' + slug;
};

export const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};
