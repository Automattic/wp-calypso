import { fetchSiteDomains, setPrimaryDomain } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';

export const siteDomainsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'domains' ],
		queryFn: () => fetchSiteDomains( siteId ),
	} );

export const siteSetPrimaryDomainMutation = () =>
	mutationOptions( {
		mutationFn: ( { siteId, domain }: { siteId: number; domain: string } ) =>
			setPrimaryDomain( siteId, domain ),
		onSuccess: ( data, { siteId } ) => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( siteDomainsQuery( siteId ) );
		},
	} );
