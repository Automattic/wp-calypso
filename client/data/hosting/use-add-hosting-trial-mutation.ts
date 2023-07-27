import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface Variables {
	siteId: number;
	planSlug: string;
}

export default function useAddHostingTrialMutation(
	options: UseMutationOptions< unknown, unknown, Variables > = {}
) {
	const mutation = useMutation( {
		mutationFn: async ( { siteId, planSlug }: Variables ) =>
			wp.req.post( {
				path: `/sites/${ siteId }/hosting/trial/add/${ planSlug }`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
	} );

	const { mutate } = mutation;

	const addHostingTrial = useCallback(
		( siteId: number, planSlug: string ) => mutate( { siteId, planSlug } ),
		[ mutate ]
	);

	return { addHostingTrial, ...mutation };
}
