import wpcom from 'calypso/lib/wp';
import { DomainsApiError, GetDomainNoticesResponseDataSuccess } from './types';

export function getDomainNotices(
	domainName: string,
	onComplete: ( data: GetDomainNoticesResponseDataSuccess ) => void,
	onError: ( error: DomainsApiError ) => void
) {
	wpcom.req
		.get( { path: `/me/domains/${ domainName }/notices` } )
		.then( ( data: GetDomainNoticesResponseDataSuccess ) => onComplete( data ) )
		.catch( ( error: DomainsApiError ) => onError( error ) );
}
