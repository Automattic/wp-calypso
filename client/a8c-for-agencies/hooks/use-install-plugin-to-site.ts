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
	const isAPIEnabled = false; // FIXME: Remove this once the API is enabled
	return isAPIEnabled
		? wpcom.req.post(
				{
					path: `/jetpack-blogs/${ siteId }/rest-api`,
					apiNamespace: 'rest/v1.1',
				},
				{
					path: '/wp/v2/plugins/',
					body: JSON.stringify( {
						slug: pluginSlug,
						status: 'active',
					} ),
					json: true,
				}
		  )
		: Promise.resolve();
}

export default function useInstallPluginToSiteMutation< TContext = unknown >(
	options?: UseMutationOptions< void, APIError, InstallPluginToSiteMutationOptions, TContext >
): UseMutationResult< void, APIError, InstallPluginToSiteMutationOptions, TContext > {
	return useMutation< void, APIError, InstallPluginToSiteMutationOptions, TContext >( {
		...options,
		mutationFn: mutationInstallPluginToSite,
	} );
}
