import { wpcom } from '../wpcom-fetcher';
import type { ReadProfileSettingsResponse } from './types';

export const fetchReadProfileSettings = (
	userIdOrLogin: number | string
): Promise< ReadProfileSettingsResponse > => {
	return wpcom.req.get( {
		path: `/read/users/${ encodeURIComponent( String( userIdOrLogin ) ) }/profile-settings`,
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );
};
