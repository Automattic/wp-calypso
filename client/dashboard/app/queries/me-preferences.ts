import { fetchPreferences, updatePreferences } from '../../data/me-preferences';
import { queryClient } from '../query-client';
import type { UserPreferences } from '../../data/me-preferences';

const defaultValues: UserPreferences = {
	'sites-view': {},
	'some-string': '',
};

export const userPreferencesQuery = () => ( {
	queryKey: [ 'me', 'preferences' ],
	queryFn: fetchPreferences,
	select: ( data: Partial< UserPreferences > ) => ( { ...defaultValues, ...data } ),
} );

export const userPreferenceQuery = < P extends keyof UserPreferences >( preferenceName: P ) => ( {
	queryKey: userPreferencesQuery().queryKey,
	queryFn: fetchPreferences,
	select: ( data: Partial< UserPreferences > ) => {
		const fetchedValue = data[ preferenceName ];
		return fetchedValue === undefined ? defaultValues[ preferenceName ] : fetchedValue;
	},
} );

export const userPreferenceMutation = < P extends keyof UserPreferences >(
	preferenceName: P
) => ( {
	mutationFn: ( data: UserPreferences[ P ] ) =>
		updatePreferences( {
			[ preferenceName ]: data,
		} ),
	onSuccess: ( newData: Partial< UserPreferences > ) => {
		queryClient.setQueryData(
			userPreferencesQuery().queryKey,
			( oldData: UserPreferences | undefined ) => ( oldData ? { ...oldData, ...newData } : newData )
		);
	},
} );
