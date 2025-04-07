import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface InstallPluginToSiteMutationOptions {
	siteId: number;
	pluginSlug: string;
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

function mutationInstallPluginToSite( {
	siteId,
	pluginSlug,
}: InstallPluginToSiteMutationOptions ): Promise< void > {
	return wpcom.req.post( {
		apiNamespace: 'wp/v2',
		path: `/sites/${ siteId }/plugins`,
		body: {
			slug: pluginSlug,
			status: 'active',
		},
	} );
}

export default function useInstallPluginToSiteMutation< TContext = unknown >(
	options?: UseMutationOptions< void, APIError, InstallPluginToSiteMutationOptions, TContext >
): UseMutationResult< void, APIError, InstallPluginToSiteMutationOptions, TContext > {
	return useMutation< void, APIError, InstallPluginToSiteMutationOptions, TContext >( {
		...options,
		mutationFn: mutationInstallPluginToSite,
	} );
}
