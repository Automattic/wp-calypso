type AgencyDisconnectSiteQueryArgs = {
	siteId: number;
	siteSlug: string;
	type?: string;
};

export const getAgencyDisconnectSiteQueryArgs = ( {
	siteId,
	siteSlug,
	type,
}: AgencyDisconnectSiteQueryArgs ) => ( {
	site_id: siteId,
	site_url: siteSlug,
	...( type ? { type } : {} ),
} );

export const getAgencyDisconnectSiteId = ( siteId: unknown ): number | undefined => {
	if ( typeof siteId !== 'string' && typeof siteId !== 'number' ) {
		return undefined;
	}

	const numericSiteId = Number( siteId );

	return Number.isInteger( numericSiteId ) && numericSiteId > 0 ? numericSiteId : undefined;
};

export const getDisconnectedAgencySiteQueryArgs = ( {
	siteId,
	siteSlug,
}: Omit< AgencyDisconnectSiteQueryArgs, 'type' > ) =>
	getAgencyDisconnectSiteQueryArgs( {
		siteId,
		siteSlug,
		type: 'down',
	} );
