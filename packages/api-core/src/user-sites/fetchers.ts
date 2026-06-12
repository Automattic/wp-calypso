import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import { UserSitesResponse } from './types';

export const fetchUserSites = ( userId: number ): Promise< UserSitesResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/users/${ userId }/sites`, {
			caller: 'reader', // To identify the caller of the API which filter the sites accordingly.
		} ),
		apiNamespace: 'wpcom/v2',
	} );
};
