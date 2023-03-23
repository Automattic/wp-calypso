import { useMutation } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import type { SubscriptionManagerUserSettings, EmailSettingsAPIResponse } from '../types';

const useSubscriptionManagerUserSettingsMutation = () => {
	const isLoggedIn = useIsLoggedIn();

	return useMutation< SubscriptionManagerUserSettings, Error, SubscriptionManagerUserSettings >(
		async ( data: SubscriptionManagerUserSettings ) => {
			const { settings } = await callApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				method: 'POST',
				body: data,
				isLoggedIn,
			} );
			return settings;
		}
	);
};

export { useSubscriptionManagerUserSettingsMutation };
