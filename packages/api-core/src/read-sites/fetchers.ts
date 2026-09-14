import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadSiteResponse } from './types';

const fields = [
	'ID',
	'name',
	'title',
	'URL',
	'icon',
	'is_following',
	'is_jetpack',
	'description',
	'is_private',
	'feed_ID',
	'feed_URL',
	'capabilities',
	'prefer_feed',
	'subscribers_count',
	'options',
	'subscription',
	'is_blocked',
	'unseen_count',
].join( ',' );
const options = [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' );

export const fetchReadSite = ( siteId: number ): Promise< ReadSiteResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/read/sites/${ siteId }`, { fields, options } ),
		apiVersion: '1.1',
		method: 'GET',
	} );
};
