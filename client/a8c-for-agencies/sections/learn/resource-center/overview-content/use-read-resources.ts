import {
	rawUserPreferencesQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import {
	NO_READ_IDS,
	READ_RESOURCES_PREFERENCE,
} from 'calypso/dashboard/agency/resources/learn/lib/read-resources';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import type { UserPreferences } from '@automattic/api-core';

/** The resources the user has marked as read, kept in their preferences. */
export function useReadResources() {
	const dispatch = useDispatch();
	// This dashboard renders with its own query client, which the shared
	// optimistic preference mutation doesn't update, so this updates it here.
	const queryClient = useQueryClient();
	const preferencesKey = rawUserPreferencesQuery().queryKey;

	const { data: readIds = NO_READ_IDS } = useQuery(
		userPreferenceQuery( READ_RESOURCES_PREFERENCE )
	);
	const { mutate: setReadIds } = useMutation( {
		...userPreferenceMutation( READ_RESOURCES_PREFERENCE ),
		onMutate: async ( ids: number[] ) => {
			await queryClient.cancelQueries( { queryKey: preferencesKey } );
			const previous = queryClient.getQueryData< UserPreferences >( preferencesKey );
			queryClient.setQueryData< UserPreferences >( preferencesKey, ( preferences ) => ( {
				...preferences,
				[ READ_RESOURCES_PREFERENCE ]: ids,
			} ) );
			return { previous };
		},
		onError: ( _error, _ids, context ) => {
			queryClient.setQueryData( preferencesKey, context?.previous );
			queryClient.invalidateQueries( { queryKey: preferencesKey } );
			dispatch( errorNotice( __( 'Failed to save reading status.' ) ) );
		},
	} );

	return { readIds, setReadIds };
}
