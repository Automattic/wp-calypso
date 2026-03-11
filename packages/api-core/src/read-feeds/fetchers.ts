import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadFeedItem, ReadFeedSearchSort, ReadFeedSearchResponse } from './types';

export const fetchReadFeedSearch = ( options: {
	query?: string;
	excludeFollowed?: boolean;
	sort?: ReadFeedSearchSort;
} ): Promise< ReadFeedSearchResponse > => {
	const { query, excludeFollowed, sort } = options;

	return wpcom.req.get( {
		path: addQueryArgs( '/read/feed', {
			q: query,
			exclude_followed: excludeFollowed,
			sort,
		} ),
		apiVersion: '1.1',
		method: 'GET',
	} );
};

export const fetchReadFeed = ( feedId: number | string ): Promise< ReadFeedItem > => {
	return wpcom.req.get( {
		path: `/read/feed/${ feedId }`,
		apiVersion: '1.1',
		method: 'GET',
	} );
};
