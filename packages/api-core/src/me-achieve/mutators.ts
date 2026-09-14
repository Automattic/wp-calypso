import { wpcom } from '../wpcom-fetcher';
import type { AchievementKey, UnlockAchievementResponse } from './types';

export async function unlockAchievement(
	key: AchievementKey
): Promise< UnlockAchievementResponse > {
	return wpcom.req.post(
		{
			path: '/me/achieve',
			apiNamespace: 'wpcom/v2',
		},
		{ key }
	);
}
