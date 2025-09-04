import {
	fetchDomainMappingSetupInfo,
	updateConnectionModeAndGetMappingStatus,
} from '@automattic/api-core';
import { queryClient } from '@automattic/api-queries';
import { queryOptions, mutationOptions } from '@tanstack/react-query';

export const domainConnectionSetupInfoQuery = (
	domainName: string,
	siteId: number,
	redirectURL?: string
) =>
	queryOptions( {
		queryKey: [ 'domain-setup-info', domainName, siteId ],
		queryFn: () => fetchDomainMappingSetupInfo( domainName, siteId, redirectURL || '' ),
	} );

export const updateConnectionModeMutation = ( domainName: string, siteId: number ) =>
	mutationOptions( {
		mutationFn: ( connectionMode: string ) =>
			updateConnectionModeAndGetMappingStatus( domainName, connectionMode ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainConnectionSetupInfoQuery( domainName, siteId ) );
		},
	} );
