import { useQuery } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn, useIsQueryEnabled } from '../hooks';
import type { SubscriptionManagerUserSettings, EmailSettingsAPIResponse } from '../types';

const useUserSettingsQuery = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const enabled = useIsQueryEnabled();
	const cacheKey = useCacheKey( [ 'read', 'email-settings' ] );
	return useQuery< SubscriptionManagerUserSettings >( {
		queryKey: cacheKey,
		queryFn: async () => {
			const { settings } = await callApi< EmailSettingsAPIResponse >( {
				path: '/read/email-settings',
				isLoggedIn,
			} );
			return settings;
		},
		enabled,
		refetchOnWindowFocus: false,
	} );
};

export default useUserSettingsQuery;
