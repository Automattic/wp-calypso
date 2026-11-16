import {
	fetchSiteDomains,
	isAtomicPrimaryDomainChangeFailed,
	setPrimaryDomain,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';

/**
 * @deprecated use either domainQuery or domainsQuery or something else (we'll need separate endpoint to get emails)
 */
export const siteDomainsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'domains' ],
		queryFn: () => fetchSiteDomains( siteId ),
	} );

const refetchSitePrimaryDomain = ( siteId: number ) => {
	queryClient.invalidateQueries( siteQueryFilter( siteId ) );
	queryClient.invalidateQueries( { queryKey: [ 'site', siteId, 'domains' ] } );
	queryClient.invalidateQueries( { queryKey: [ 'domains' ] } );
};

export const siteSetPrimaryDomainMutation = () =>
	mutationOptions( {
		meta: { statId: 'site-primary-domain-set' },
		mutationFn: ( { siteId, domain }: { siteId: number; domain: string } ) =>
			setPrimaryDomain( siteId, domain ),
		onSuccess: ( data, { siteId } ) => refetchSitePrimaryDomain( siteId ),
		onError: ( error, { siteId } ) => {
			if ( isAtomicPrimaryDomainChangeFailed( error ) ) {
				refetchSitePrimaryDomain( siteId );
			}
		},
	} );
