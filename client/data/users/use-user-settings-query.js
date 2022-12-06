import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

const useUserSettingsQuery = () => {
	return useQuery( getCacheKey(), () => fetchUserSettings(), {
		staleTime: Infinity,
		refetchInterval: false,
		refetchOnMount: 'always',
	} );
};

export function fetchUserSettings() {
	return wpcomRequest( { path: '/me/settings', apiVersion: '1.1' } );
}

export function getCacheKey() {
	return [ 'user-settings' ];
}

export default useUserSettingsQuery;
