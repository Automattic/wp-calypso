import { translate } from 'i18n-calypso';
import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import type { SubscriptionManagerUserSettings, EmailSettingsAPIResponse } from '../types';

const useUserSettingsMutation = () => {
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
				} else {
					throw new Error(
						translate( 'Something went wrong.', {
							context: 'Something went wrong will saving the user settings',
						} ) as string
					);
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

export default useUserSettingsMutation;
