import { useMutation } from '@tanstack/react-query';
import { LeadMutationResponse } from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';

export const useUnsubscribeMutation = ( url?: string, hash?: string ) => {
	return useMutation( {
		mutationKey: [ 'email-unsubscribe', url, hash ],
		mutationFn: (): Promise< LeadMutationResponse > =>
			wp.req.get(
				{
					path: '/site-profiler/emails/unsubscribe',
					apiNamespace: 'wpcom/v2',
				},
				{
					url,
					hash,
				}
			),
	} );
};
