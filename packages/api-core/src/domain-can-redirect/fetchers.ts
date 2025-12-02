import { wpcom } from '../wpcom-fetcher';

export const domainCanRedirect = ( siteId: number, domainName: string ) =>
	wpcom.req.get(
		`/domains/${ siteId }/${ encodeURIComponent( domainName.toLowerCase() ) }/can-redirect`
	);
