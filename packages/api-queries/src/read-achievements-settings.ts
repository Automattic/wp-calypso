import { fetchReadAchievementsSettings } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readAchievementsSettingsQuery = ( userIdOrLogin?: number | string | null ) => {
	return queryOptions( {
		queryKey: [ 'read', 'achievements', userIdOrLogin, 'settings' ],
		queryFn: () => fetchReadAchievementsSettings( userIdOrLogin! ),
		enabled: userIdOrLogin != null,
		staleTime: 60 * 1000, // 1 minute
	} );
};
