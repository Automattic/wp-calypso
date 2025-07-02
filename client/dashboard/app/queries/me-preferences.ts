import { fetchPreferences, updatePreferences } from '../../data/me-preferences';
import { queryClient } from '../query-client';
import type { UserPreferences } from '../../data/me-preferences';

export const mePreferencesQuery = () => ( {
	queryKey: [ 'me', 'preferences' ],
	queryFn: fetchPreferences,
} );

export const mePreferencesMutation = () => ( {
	mutationFn: updatePreferences,
	onSuccess: ( newData: Partial< UserPreferences > ) => {
		queryClient.setQueryData(
			mePreferencesQuery().queryKey,
			( oldData: UserPreferences | undefined ) => ( oldData ? { ...oldData, ...newData } : newData )
		);
	},
} );
