import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface APIError {
	status: number;
	code: string;
	message: string;
}

export interface InstallPluginParams {
	siteId?: number;
	slug: string;
	status?: 'active' | 'inactive';
}

interface APIResponse {
	id: string;
	name: string;
	plugin: string;
	slug: string;
	status: string;
	version: string;
	// Add other plugin properties as needed
}

function installPluginMutation( params: InstallPluginParams ): Promise< APIResponse > {
	const { siteId, slug, status = 'active' } = params;

	return wpcom.req.post(
		{
			path: `/jetpack-blogs/${ siteId }/rest-api/`,
			apiNamespace: 'rest/v1.1',
		},
		{
			path: '/wp/v2/plugins/',
			body: JSON.stringify( {
				slug,
				status,
			} ),
			json: true,
		}
	);
}

/**
 * Hook to install and optionally activate a plugin on a specific site
 * @param options Optional mutation options
 * @returns UseMutationResult for installing plugins
 */
export default function useInstallSitePlugins< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, InstallPluginParams, TContext >
): UseMutationResult< APIResponse, APIError, InstallPluginParams, TContext > {
	const queryClient = useQueryClient();

	return useMutation< APIResponse, APIError, InstallPluginParams, TContext >( {
		...options,
		mutationFn: installPluginMutation,
		onSuccess: ( data, variables, context ) => {
			// Invalidate the site plugins query to refetch the updated list
			queryClient.invalidateQueries( {
				queryKey: [ 'site-plugins', variables.siteId ],
			} );

			// Call the original onSuccess if provided
			if ( options?.onSuccess ) {
				options.onSuccess( data, variables, context );
			}
		},
	} );
}
