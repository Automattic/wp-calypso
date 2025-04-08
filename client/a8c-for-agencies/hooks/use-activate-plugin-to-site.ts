import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface ActivatePluginToSiteMutationOptions {
	siteId: number;
	pluginSlug: string;
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

function mutationActivatePluginToSite( {
	siteId,
	pluginSlug,
}: ActivatePluginToSiteMutationOptions ): Promise< void > {
	return wpcom.req.post( {
		apiNamespace: 'wp/v2',
		path: `/sites/${ siteId }/plugins/${ pluginSlug }`,
		body: {
			status: 'active',
		},
	} );
}

export default function useActivatePluginToSiteMutation< TContext = unknown >(
	options?: UseMutationOptions< void, APIError, ActivatePluginToSiteMutationOptions, TContext >
): UseMutationResult< void, APIError, ActivatePluginToSiteMutationOptions, TContext > {
	return useMutation< void, APIError, ActivatePluginToSiteMutationOptions, TContext >( {
		...options,
		mutationFn: mutationActivatePluginToSite,
	} );
}
