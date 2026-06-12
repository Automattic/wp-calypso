import { useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getMcpSettingsQueryKey } from './use-fetch-mcp-settings';
import useUpdateMcpSettingsMutation from './use-update-mcp-settings-mutation';
import type { McpSettings, McpSettingsUpdate, McpApiError } from './types';
import type { UseMutationResult } from '@tanstack/react-query';

/**
 * Apply an in-flight `McpSettingsUpdate` to a cached `McpSettings` snapshot
 * so the optimistic-update path produces the same shape the server would
 * return. Pure so it stays testable in isolation from react-query / redux.
 */
function applyUpdate( previous: McpSettings, update: McpSettingsUpdate ): McpSettings {
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

interface OptimisticContext {
	previous?: McpSettings;
}

/**
 * Higher-level wrapper around `useUpdateMcpSettingsMutation` that adds the
 * optimistic-update + user-notice wiring callers want from a settings UI:
 *
 *   - Flips the cached settings synchronously so toggles can update without
 *     waiting for the server round-trip.
 *   - Rolls back to the previous snapshot on failure so the toggle snaps
 *     back to its real state.
 *   - Shows a generic success/error notice (stable id + duration) on save.
 *
 * Returns the underlying mutation result, so callers can keep using
 * `.mutate(update)` and read `.isPending` etc. as if they were calling the
 * lower-level hook directly.
 */
export default function useSaveMcpSettings(): UseMutationResult<
	McpSettings,
	McpApiError,
	McpSettingsUpdate,
	OptimisticContext
> {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );
	const queryKey = useMemo( () => getMcpSettingsQueryKey( agencyId ), [ agencyId ] );

	return useUpdateMcpSettingsMutation< OptimisticContext >( {
		onMutate: async ( update ) => {
			await queryClient.cancelQueries( { queryKey } );
			const previous = queryClient.getQueryData< McpSettings >( queryKey );
			if ( previous ) {
				queryClient.setQueryData( queryKey, applyUpdate( previous, update ) );
			}
			return { previous };
		},
		onError: ( _err, _vars, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( queryKey, context.previous );
			}
			dispatch(
				errorNotice( __( 'Failed to save MCP settings.' ), {
					id: 'a4a-ai-mcp-settings-save-failed',
					duration: 8000,
				} )
			);
		},
		onSuccess: () => {
			dispatch(
				successNotice( __( 'MCP settings saved.' ), {
					id: 'a4a-ai-mcp-settings-saved',
					duration: 5000,
				} )
			);
		},
	} );
}
