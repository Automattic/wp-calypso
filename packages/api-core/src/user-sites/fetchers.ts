import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import { UserSitesResponse } from './types';

export const fetchUserSites = (
	userId: number,
	{ owner }: { owner?: boolean } = {}
): Promise< UserSitesResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/users/${ userId }/sites`, {
			caller: 'reader', // To identify the caller of the API which filter the sites accordingly.
			// When the requester is the profile owner, ask for the full, unfiltered list
			// annotated with `is_hidden` so the profile settings UI can render per-site toggles.
			...( owner ? { owner: 1 } : {} ),
		} ),
		apiNamespace: 'wpcom/v2',
	} );
};
