export const marketingTraffic = (siteSlug?: string | null ): string => {
	return `/marketing/traffic/${ siteSlug || '' }`;
};

export const marketingSharingButtons = (siteSlug?: string | null ): string => {
	return `/marketing/sharing-buttons/${ siteSlug || '' }`;
};
