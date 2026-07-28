import { addQueryArgs } from 'calypso/lib/url';
import { urlToSlug } from 'calypso/lib/url/http-utils';

type AgencyDisconnectSitePathArgs = {
	siteId: number;
	siteSlug: string;
	type?: string;
};

type DisconnectedAgencySitePathArgs = {
	siteId: number;
	siteUrl: string;
};

const disconnectSitePath = ( siteSlug: string ) => `/settings/disconnect-site/${ siteSlug }`;
const disconnectSiteConfirmPath = ( siteSlug: string ) =>
	`/settings/disconnect-site/confirm/${ siteSlug }`;

const getAgencyDisconnectSiteQueryArgs = ( {
	siteId,
	siteSlug,
	type,
}: AgencyDisconnectSitePathArgs ) => ( {
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

export const getAgencyDisconnectSiteHref = ( args: AgencyDisconnectSitePathArgs ) =>
	addQueryArgs( getAgencyDisconnectSiteQueryArgs( args ), disconnectSitePath( args.siteSlug ) );

export const getAgencyDisconnectSiteConfirmHref = ( args: AgencyDisconnectSitePathArgs ) =>
	addQueryArgs(
		getAgencyDisconnectSiteQueryArgs( args ),
		disconnectSiteConfirmPath( args.siteSlug )
	);

export const getDisconnectedAgencySiteTroubleshootingHref = ( {
	siteId,
	siteUrl,
}: DisconnectedAgencySitePathArgs ) => {
	const siteSlug = urlToSlug( siteUrl );

	return getAgencyDisconnectSiteHref( {
		siteId,
		siteSlug,
		type: 'down',
	} );
};

export const getDisconnectedAgencySiteRemovalHref = ( {
	siteId,
	siteUrl,
}: DisconnectedAgencySitePathArgs ) => {
	const siteSlug = urlToSlug( siteUrl );

	return getAgencyDisconnectSiteConfirmHref( {
		siteId,
		siteSlug,
		type: 'down',
	} );
};
