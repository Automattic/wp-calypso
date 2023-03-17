import { useQuery } from 'react-query';
import { fetchFromApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import type { SubscriptionManagerUserSettings } from '../types';

type EmailSettingsAPIResponse = {
	settings: SubscriptionManagerUserSettings;
};

const useSubscriptionManagerUserSettingsQuery = () => {
	const isLoggedIn = useIsLoggedIn();

	return useQuery( {
		initialData: {},
		queryKey: [ 'read', 'email-settings', isLoggedIn ],
		queryFn: async () => {
			const { settings } = await fetchFromApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				isLoggedIn,
			} );
			return settings;
		},
	} );
};

export { useSubscriptionManagerUserSettingsQuery };
