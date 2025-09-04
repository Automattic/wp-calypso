import {
	fetchDomainSetupInfo,
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
		queryFn: () => fetchDomainSetupInfo( domainName, siteId, redirectURL || '' ),
		enabled: !! siteId && !! domainName,
	} );

export const updateConnectionModeMutation = ( domainName: string, siteId: number ) =>
	mutationOptions( {
		mutationFn: ( connectionMode: string ) =>
			updateConnectionModeAndGetMappingStatus( domainName, connectionMode ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainConnectionSetupInfoQuery( domainName, siteId ) );
		},
	} );
