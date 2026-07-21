import {
	fetchAgency,
	fetchAgencyResources,
	fetchAgencyScheduleCallLink,
	fetchAgencyMcpSettings,
	updateAgencyMcpSettings,
	fetchTipaltiIFrameUrl,
	fetchTipaltiPayee,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { Agency, McpSettings, McpSettingsUpdate } from '@automattic/api-core';

// Mirror the server's response shape so the optimistic snapshot matches what
// onSuccess later writes.
function applyMcpUpdate( previous: McpSettings, update: McpSettingsUpdate ): McpSettings {
	return {
		...previous,
		enabled: update.enabled ?? previous.enabled,
		available_abilities: previous.available_abilities.map( ( ability ) =>
			update.abilities && Object.prototype.hasOwnProperty.call( update.abilities, ability.name )
				? { ...ability, enabled: !! update.abilities[ ability.name ] }
				: ability
		),
	};
}

type AgencyQueryResult = {
	id?: number;
	isClientUser: boolean;
	hasAgency: boolean;
};

export const agencyQuery = () =>
	queryOptions( {
		queryKey: [ 'agency' ] as const,
		queryFn: async () => {
			const data = await fetchAgency();
			let agency: AgencyQueryResult;

			if ( Array.isArray( data ) ) {
				agency = { id: data[ 0 ]?.id, isClientUser: false, hasAgency: data.length > 0 };
			} else {
				agency = {
					isClientUser: !! data.is_client_user,
					hasAgency: false,
				};
			}

			return agency;
		},
		// Agency membership rarely changes within a session, so we avoid
		// refetching on every mount, focus, and route-guard check.
		staleTime: 5 * 60 * 1000,
	} );

/**
 * Returns the active agency (the first one returned by the API), or null when
 * the current user is not an agency user.
 */
export const activeAgencyQuery = () =>
	queryOptions( {
		queryKey: [ 'agency', 'active' ] as const,
		queryFn: async (): Promise< Agency | null > => {
			const data = await fetchAgency();
			if ( Array.isArray( data ) ) {
				return data[ 0 ] ?? null;
			}
			return null;
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );

/**
 * Lazily fetches the growth-accelerator "schedule a call" link for an agency.
 * Disabled by default; trigger with `refetch()` on user interaction.
 */
export const agencyScheduleCallLinkQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'schedule-call-link' ] as const,
		queryFn: () => fetchAgencyScheduleCallLink( agencyId ),
		enabled: false,
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );

export const agencyResourcesQuery = () =>
	queryOptions( {
		queryKey: [ 'agency', 'resources' ] as const,
		queryFn: fetchAgencyResources,
		staleTime: 5 * 60 * 1000,
	} );

export const tipaltiIFrameUrlQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'tipalti-iframe-url' ] as const,
		queryFn: () => fetchTipaltiIFrameUrl( agencyId ),
		enabled: !! agencyId,
	} );

export const tipaltiPayeeQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'tipalti-payee' ] as const,
		queryFn: () => fetchTipaltiPayee( agencyId ),
		enabled: !! agencyId,
	} );

export const mcpSettingsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'mcp-settings' ] as const,
		queryFn: () => fetchAgencyMcpSettings( agencyId ),
		enabled: !! agencyId,
	} );

export const agencyMcpSettingsMutation = ( agencyId: number ) => {
	const queryKey = mcpSettingsQuery( agencyId ).queryKey;
	return mutationOptions( {
		meta: { statId: 'agcy-mcp-settings-update' },
		mutationFn: ( update: McpSettingsUpdate ) => updateAgencyMcpSettings( agencyId, update ),
		onMutate: async ( update: McpSettingsUpdate ) => {
			await queryClient.cancelQueries( { queryKey } );
			const previous = queryClient.getQueryData< McpSettings >( queryKey );
			if ( previous ) {
				queryClient.setQueryData( queryKey, applyMcpUpdate( previous, update ) );
			}
			return { previous };
		},
		onError: (
			_error: unknown,
			_update: McpSettingsUpdate,
			context?: { previous?: McpSettings }
		) => {
			if ( context?.previous ) {
				queryClient.setQueryData( queryKey, context.previous );
			}
		},
		onSuccess: ( data: McpSettings ) => {
			queryClient.setQueryData( queryKey, data );
		},
	} );
};
