import { useMutation } from '@tanstack/react-query';
import { LeadMutationResponse } from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';

export const useLeadMutation = ( url?: string, hash?: string ) => {
	return useMutation( {
		mutationKey: [ 'lead', url, hash ],
		mutationFn: (): Promise< LeadMutationResponse > =>
			wp.req.post(
				{
					path: '/site-profiler/lead',
					apiNamespace: 'wpcom/v2',
				},
				{
					url,
					hash,
				}
			),
	} );
};
