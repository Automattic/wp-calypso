import { useQuery } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import useCacheKey from '../hooks/use-cache-key';
import type { SubscriptionManagerUserSettings, EmailSettingsAPIResponse } from '../types';

const useUserSettingsQuery = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( [ 'read', 'email-settings' ] );
	return useQuery< SubscriptionManagerUserSettings >(
		cacheKey,
		async () => {
			const { settings } = await callApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				isLoggedIn,
			} );
			return settings;
		},
		{
			enabled,
			refetchOnWindowFocus: false,
		}
	);
};

export default useUserSettingsQuery;
