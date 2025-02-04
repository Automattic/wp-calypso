export const marketingConnections = ( siteSlug?: string | null ): string => {
	return `/marketing/connections/${ siteSlug || '' }`;
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
