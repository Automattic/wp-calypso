import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
	UseMutationResult,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getMcpSettingsQueryKey } from './use-fetch-mcp-settings';
import type { McpApiError, McpSettings, McpSettingsUpdate } from './types';

function updateMcpSettings( input: McpSettingsUpdate ): Promise< McpSettings > {
	return wpcom.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: '/a4a-mcp/settings',
		},
		input
	);
}

export default function useUpdateMcpSettingsMutation< TContext = unknown >(
	options?: UseMutationOptions< McpSettings, McpApiError, McpSettingsUpdate, TContext >
): UseMutationResult< McpSettings, McpApiError, McpSettingsUpdate, TContext > {
	const queryClient = useQueryClient();

	return useMutation< McpSettings, McpApiError, McpSettingsUpdate, TContext >( {
		...options,
		mutationFn: updateMcpSettings,
		onSuccess: ( next, variables, context ) => {
			// Seed the query cache with the fresh server state so the UI stays in sync
			// without an extra round-trip.
			queryClient.setQueryData( getMcpSettingsQueryKey(), next );
			options?.onSuccess?.( next, variables, context );
		},
	} );
}
