export const marketingConnections = ( siteSlug?: string | null ): string => {
	return siteSlug ? `https://${ siteSlug }/wp-admin/admin.php?page=jetpack-social` : '';
};

export const marketingTraffic = ( siteSlug?: string | null ): string => {
	return `/marketing/traffic/${ siteSlug || '' }`;
};

export const marketingSharingButtons = ( siteSlug?: string | null ): string => {
	return `/marketing/sharing-buttons/${ siteSlug || '' }`;
};

export const pluginsPath = ( siteSlug?: string | null ): string => {
	return `/plugins/${ siteSlug || '' }`;
};
