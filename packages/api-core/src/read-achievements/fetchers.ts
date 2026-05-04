import { wpcom } from '../wpcom-fetcher';
import type { AchievementsResponse } from './types';

export async function fetchReadAchievements(
	userIdOrLogin: number | string,
	page: number
): Promise< AchievementsResponse > {
	return wpcom.req.get(
		{
			path: `/read/achievements/${ encodeURIComponent( String( userIdOrLogin ) ) }`,
			apiNamespace: 'wpcom/v2',
			method: 'GET',
		},
		{ number: 100, page }
	);
}
