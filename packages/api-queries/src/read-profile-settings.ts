import { fetchReadProfileSettings } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readProfileSettingsQuery = ( userIdOrLogin: number | string ) => {
	return queryOptions( {
		queryKey: [ 'read', 'users', userIdOrLogin, 'profile-settings' ],
		queryFn: () => fetchReadProfileSettings( userIdOrLogin ),
		enabled: !! userIdOrLogin,
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
};
