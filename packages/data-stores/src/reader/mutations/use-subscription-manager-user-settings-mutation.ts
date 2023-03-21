import { useMutation } from 'react-query';
import { callApi } from '../helpers';
import type { SubscriptionManagerUserSettings } from '../types';

type APIError = {
	error: string;
	message: string;
};

type ApiSubscriptionManagerUserSettings = {
	settings: SubscriptionManagerUserSettings;
};

const useSubscriptionManagerUserSettingsMutation = () => {
	return useMutation<
		ApiSubscriptionManagerUserSettings,
		APIError,
		SubscriptionManagerUserSettings
	>( ( data: SubscriptionManagerUserSettings ) => {
		return callApi< ApiSubscriptionManagerUserSettings >( {
			path: '/read/email-settings',
			method: 'POST',
			body: data,
			isLoggedIn: true,
		} );
	} );
};

export { useSubscriptionManagerUserSettingsMutation };
