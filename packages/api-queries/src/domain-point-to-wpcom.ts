import { pointDomainToWpcom } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainPointToWpcomMutation = ( domain: string ) =>
	mutationOptions( {
		meta: { statId: 'domain-wpcom-point' },
		mutationFn: () => pointDomainToWpcom( domain ),
		onSuccess: () => queryClient.invalidateQueries( { queryKey: [ 'domains' ] } ),
	} );
