import wpcom from 'calypso/lib/wp';
import type { DomainsApiError } from './types';

export function getSiteSlugFromDomain(
	domainName: string,
	onComplete: ( data: string ) => void,
	onError: ( error: DomainsApiError ) => void
) {
	wpcom.req
		.get( { path: `/domains/${ domainName }/sitename` } )
		.then( ( data: string ) => onComplete( data ) )
		.catch( ( error: DomainsApiError ) => onError( error ) );
}
