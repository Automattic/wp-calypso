import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
	UseMutationResult,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getMcpSettingsQueryKey } from './use-fetch-mcp-settings';
import type { McpApiError, McpSettings, McpSettingsUpdate } from './types';

function updateMcpSettings( input: McpSettingsUpdate, agencyId: number ): Promise< McpSettings > {
	return wpcom.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/a4a-mcp/settings`,
		},
		input
	);
}

export default function useUpdateMcpSettingsMutation< TContext = unknown >(
	options?: UseMutationOptions< McpSettings, McpApiError, McpSettingsUpdate, TContext >
): UseMutationResult< McpSettings, McpApiError, McpSettingsUpdate, TContext > {
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< McpSettings, McpApiError, McpSettingsUpdate, TContext >( {
		...options,
		mutationFn: ( input ) => {
			if ( ! agencyId ) {
				return Promise.reject( {
					status: 400,
					code: 'no_active_agency',
					message: 'No active agency in context.',
				} as McpApiError );
			}
			return updateMcpSettings( input, agencyId );
		},
		onSuccess: ( next, variables, context ) => {
			// Seed the query cache with the fresh server state so the UI stays in sync
			// without an extra round-trip.
			queryClient.setQueryData( getMcpSettingsQueryKey( agencyId ), next );
			options?.onSuccess?.( next, variables, context );
		},
	} );
}
