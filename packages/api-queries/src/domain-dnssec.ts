import { updateDNSSEC } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { domainQuery } from './domain';
import { queryClient } from './query-client';

export const domainDnssecMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( enabled: boolean ) => updateDNSSEC( domain, enabled ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domain ) );
		},
	} );
