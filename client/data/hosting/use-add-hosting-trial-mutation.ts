import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

export const HOSTING_INTENT_MIGRATE = 'migrate';

type HostingIntent = typeof HOSTING_INTENT_MIGRATE;

interface Variables {
	siteId: number;
	planSlug: string;
	hostingIntent?: HostingIntent;
}

export default function useAddHostingTrialMutation(
	options: UseMutationOptions< unknown, unknown, Variables > = {}
) {
	const mutation = useMutation( {
		mutationFn: async ( { siteId, planSlug, hostingIntent }: Variables ) => {
			const body = hostingIntent ? { hosting_intent: hostingIntent } : undefined;
			return wp.req.post( {
				path: `/sites/${ siteId }/hosting/trial/add/${ planSlug }`,
				apiNamespace: 'wpcom/v2',
				body,
			} );
		},
		...options,
	} );

	const { mutate } = mutation;

	const addHostingTrial = useCallback(
		( siteId: number, planSlug: string, hostingIntent?: HostingIntent ) =>
			mutate( { siteId, planSlug, hostingIntent } ),
		[ mutate ]
	);

	return { addHostingTrial, ...mutation };
}
