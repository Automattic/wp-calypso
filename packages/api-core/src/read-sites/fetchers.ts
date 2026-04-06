import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadFeedSiteResponse } from './types';

const fields = [ 'ID', 'name', 'title', 'URL', 'icon', 'is_following', 'description' ].join( ',' );
const options = [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' );

export const fetchReadFeedSite = ( siteId: number ): Promise< ReadFeedSiteResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/read/sites/${ siteId }`, { fields, options } ),
		apiVersion: '1.1',
		method: 'GET',
	} );
};
