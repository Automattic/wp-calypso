import { pointDomainToWpcom } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { domainQuery } from './domain';
import { queryClient } from './query-client';

export const domainPointToWpcomMutation = ( domain: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-point-to-wpcom' },
		mutationFn: () => pointDomainToWpcom( domain ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domain ) );
			queryClient.invalidateQueries( { queryKey: [ 'domains' ] } );
		},
	} );
