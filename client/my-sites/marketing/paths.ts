export const marketingToolsTraffic = ( siteSlug?: string | null ): string => {
	return `/marketing/traffic/${ siteSlug || '' }`;
};

export const marketingToolsSharingButtons = ( siteSlug?: string | null ): string => {
	return `/marketing/sharing-buttons/${ siteSlug || '' }`;
};
