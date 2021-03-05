export const marketingConnections = ( siteSlug?: string | null ): string => {
	return `/marketing/connections/${ siteSlug || '' }`;
};

export const marketingTraffic = ( siteSlug?: string | null ): string => {
	return `/marketing/traffic/${ siteSlug || '' }`;
};

export const marketingBusinessTools = ( siteSlug?: string | null ): string => {
	return `/marketing/business-tools/${ siteSlug || '' }`;
};

export const marketingSharingButtons = ( siteSlug?: string | null ): string => {
	return `/marketing/sharing-buttons/${ siteSlug || '' }`;
};

export const marketingUltimateTrafficGuide = ( siteSlug?: string | null ): string => {
	return `/marketing/ultimate-traffic-guide/${ siteSlug || '' }`;
};
