import {
	rawUserPreferencesQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import type { UserPreferences } from '@automattic/api-core';

// Shared with the classic A4A Library, so a resource read there shows as read here.
const READ_RESOURCES_PREFERENCE = 'a4a-library-read-resources';

/** The resources the user has marked as read, kept in their preferences. */
export function useReadResources() {
	// The classic dashboard renders with its own query client, which the shared
	// optimistic preference mutation doesn't update, so this updates whichever
	// client the Library is rendered with.
	const queryClient = useQueryClient();
	const preferencesKey = rawUserPreferencesQuery().queryKey;

	const { data: readIds = [] } = useQuery( userPreferenceQuery( READ_RESOURCES_PREFERENCE ) );
	const { mutate } = useMutation( {
		...withSnackbar( userPreferenceMutation( READ_RESOURCES_PREFERENCE ), {
			error: __( 'Your reading status couldn’t be saved. Please try again.' ),
		} ),
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
		},
		onSettled: () => queryClient.invalidateQueries( { queryKey: preferencesKey } ),
	} );

	const setRead = ( id: number, isRead: boolean ) =>
		mutate(
			isRead ? [ ...new Set( [ ...readIds, id ] ) ] : readIds.filter( ( readId ) => readId !== id )
		);

	return { readIds, setRead };
}
