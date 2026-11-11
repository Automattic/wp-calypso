import { getUrlParts } from '@automattic/calypso-url';

const getSiteHostname = ( url: string ) =>
	getUrlParts( /^https?:\/\//i.test( url ) ? url : `https://${ url }` )
		.hostname.replace( /^www\./, '' )
		.replace( /\.$/, '' );

export const getSiteAddresses = (
	siteSlug?: string,
	site?: { URL?: string; options?: { unmapped_url?: string } } | null
) => [ siteSlug, site?.URL, site?.options?.unmapped_url ].filter( Boolean ) as string[];

export const isSiteAddress = ( url: string, siteAddresses: string[] ) => {
	const hostname = getSiteHostname( url );
	return (
		!! hostname && siteAddresses.some( ( address ) => getSiteHostname( address ) === hostname )
	);
};
