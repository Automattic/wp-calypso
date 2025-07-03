import { fetchPreferences, updatePreferences } from '../../data/me-preferences';
import { queryClient } from '../query-client';
import type { UserPreferences } from '../../data/me-preferences';

export const userPreferencesQuery = ( preferenceName?: keyof UserPreferences ) => ( {
	queryKey: [ 'me', 'preferences' ],
	queryFn: fetchPreferences,
	select: ( data: UserPreferences ) => {
		if ( preferenceName ) {
			return data[ preferenceName ];
		}

		return data;
	},
} );

export const userPreferencesMutation = ( preferenceName?: keyof UserPreferences ) => ( {
	mutationFn: ( data ) => {
		if ( preferenceName ) {
			return updatePreferences( { [ preferenceName ]: data } );
		}

		return updatePreferences( data );
	},
	onSuccess: ( newData: Partial< UserPreferences > ) => {
		queryClient.setQueryData(
			userPreferencesQuery().queryKey,
			( oldData: UserPreferences | undefined ) => ( oldData ? { ...oldData, ...newData } : newData )
		);
	},
} );
