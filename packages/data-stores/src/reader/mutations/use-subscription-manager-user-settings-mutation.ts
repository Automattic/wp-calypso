import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import type { SubscriptionManagerUserSettings, EmailSettingsAPIResponse } from '../types';

const useSubscriptionManagerUserSettingsMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation< SubscriptionManagerUserSettings, Error, SubscriptionManagerUserSettings >(
		async ( data: SubscriptionManagerUserSettings ) => {
			const { settings } = await callApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				method: 'POST',
				body: data,
				isLoggedIn,
			} );
			if ( settings.errors ) {
				if ( settings.errors.invalid_input ) {
					throw new Error( settings.errors.invalid_input.join( ', ' ) );
				}
			}
			return settings;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries( [ 'read', 'email-settings', isLoggedIn ] );
			},
		}
	);
};

export { useSubscriptionManagerUserSettingsMutation };
