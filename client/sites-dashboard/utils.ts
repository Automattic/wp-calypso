export const getDashboardUrl = ( slug: string ) => {
	return `/home/${ slug }`;
};

export const getSettingsUrl = ( slug: string ) => {
	return `/settings/general/${ slug }`;
};

export const getPluginsUrl = ( slug: string ) => {
	return `/plugins/${ slug }`;
};

export const getManagePluginsUrl = ( slug: string ) => {
	return `/plugins/manage/${ slug }`;
};

export const getHostingConfigUrl = ( slug: string ) => {
	return `/hosting-config/${ slug }`;
};

export const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};

export const MEDIA_QUERIES = {
	small: '@media screen and ( max-width: 600px )',
	mediumOrSmaller: '@media screen and ( max-width: 781px )',
	mediumOrLarger: '@media screen and ( min-width: 660px )',
	large: '@media screen and ( min-width: 960px )',
};
