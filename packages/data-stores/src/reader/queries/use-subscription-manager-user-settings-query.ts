import { useQuery } from 'react-query';
import { fetchFromApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SubscriptionManagerUserSettings } from '../types';

type EmailSettingsAPIResponse = {
	settings: SubscriptionManagerUserSettings;
};

const useSubscriptionManagerUserSettingsQuery = () => {
	const isLoggedIn = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	return useQuery(
		[ 'read', 'email-settings', isLoggedIn ],
		async () => {
			const { settings } = await fetchFromApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				isLoggedIn,
			} );
			return settings;
		},
		{
			enabled,
			initialData: {},
		}
	);
};

export { useSubscriptionManagerUserSettingsQuery };
