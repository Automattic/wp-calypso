import { wpcom } from '../wpcom-fetcher';
import type { ReadAchievementsSettingsResponse } from './types';

export const fetchReadAchievementsSettings = (
	userIdOrLogin: number | string
): Promise< ReadAchievementsSettingsResponse > => {
	return wpcom.req.get( {
		path: `/read/achievements/${ encodeURIComponent( String( userIdOrLogin ) ) }/settings`,
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );
};
