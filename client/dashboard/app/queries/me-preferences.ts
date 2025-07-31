import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchPreferences, updatePreferences } from '../../data/me-preferences';
import { queryClient } from '../query-client';
import type { UserPreferences } from '../../data/me-preferences';

const defaultValues: Required< UserPreferences > = {
	'sites-view': {},
	'some-string': '',
};

// Returns all user preferences, without applying any defaults.
export const rawUserPreferencesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'preferences' ],
		queryFn: fetchPreferences,
	} );

export const userPreferenceQuery = < P extends keyof UserPreferences >( preferenceName: P ) =>
	queryOptions( {
		queryKey: rawUserPreferencesQuery().queryKey,
		queryFn: fetchPreferences,
		select: ( data ): Required< UserPreferences >[ P ] => {
			const fetchedValue = data[ preferenceName ];
			return fetchedValue === undefined
				? defaultValues[ preferenceName ]
				: // `fetchedValue` is a `NonNullable< UserPreferences[ P ] >`, which we know is the same
				  // as `Required< UserPreferences >[ P ]`, but the later gives better type hints when
				  // the query is used in the component.
				  ( fetchedValue as Required< UserPreferences >[ P ] );
		},
	} );

export const userPreferenceMutation = < P extends keyof UserPreferences >( preferenceName: P ) =>
	mutationOptions( {
		mutationFn: ( data: Required< UserPreferences >[ P ] ) =>
			updatePreferences( {
				[ preferenceName ]: data,
			} ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( rawUserPreferencesQuery().queryKey, ( oldData ) =>
				oldData ? { ...oldData, ...newData } : newData
			);
		},
	} );
