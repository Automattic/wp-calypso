import { fetchPreferences, updatePreferences } from '../../data/me-preferences';
import { queryClient } from '../query-client';
import type { UserPreferences } from '../../data/me-preferences';

const defaultValues: UserPreferences = {
	'sites-view': {},
	'some-string': '',
};

type HookDataType< P > = P extends keyof UserPreferences ? UserPreferences[ P ] : UserPreferences;

export const userPreferencesQuery = < P extends keyof UserPreferences | undefined = undefined >(
	preferenceName?: P
) => ( {
	queryKey: [ 'me', 'preferences' ],
	queryFn: fetchPreferences,
	select( data: Partial< UserPreferences > ): HookDataType< P > {
		if ( ! preferenceName ) {
			return { ...defaultValues, ...data } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		const fetchedValue = data[ preferenceName ];
		return fetchedValue === undefined
			? ( defaultValues[ preferenceName ] as any ) // eslint-disable-line @typescript-eslint/no-explicit-any
			: ( fetchedValue as any ); // eslint-disable-line @typescript-eslint/no-explicit-any
	},
} );

export const userPreferencesMutation = < P extends keyof UserPreferences | undefined = undefined >(
	preferenceName?: P
) => ( {
	mutationFn( data: HookDataType< P > ) {
		if ( ! preferenceName ) {
			return updatePreferences( data as any ); // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		return updatePreferences( {
			[ preferenceName ]: data,
		} );
	},
	onSuccess: ( newData: Partial< UserPreferences > ) => {
		queryClient.setQueryData(
			userPreferencesQuery().queryKey,
			( oldData: UserPreferences | undefined ) => ( oldData ? { ...oldData, ...newData } : newData )
		);
	},
} );
