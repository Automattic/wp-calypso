import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadFeedSearchSort, ReadFeedSearchResponse } from './types';

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
