import { fetchReadProfileSettings } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readProfileSettingsQuery = ( userIdOrLogin?: number | string | null ) => {
	return queryOptions( {
		queryKey: [ 'read', 'users', userIdOrLogin, 'profile-settings' ],
		queryFn: () => fetchReadProfileSettings( userIdOrLogin! ),
		enabled: userIdOrLogin != null,
		staleTime: 60 * 1000, // 1 minute
	} );
};
