import { unlockAchievement } from '@automattic/api-core';
import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import type { AchievementKey, UnlockAchievementResponse } from '@automattic/api-core';

export const unlockAchievementMutation = ( queryClient: QueryClient ) =>
	mutationOptions< UnlockAchievementResponse, Error, AchievementKey >( {
		mutationFn: unlockAchievement,
		onSuccess: ( result ) => {
			if ( result.granted ) {
				queryClient.invalidateQueries( { queryKey: [ 'read', 'achievements' ] } );
			}
		},
	} );
