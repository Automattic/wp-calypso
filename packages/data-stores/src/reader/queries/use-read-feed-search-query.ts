import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wpcom from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports
import type { FeedItem } from '../types';

export enum FeedSort {
	LastUpdated = 'last_updated',
	Relevance = 'relevance',
}

interface Options {
	query?: string;
	excludeFollowed?: boolean;
	sort?: FeedSort;
}

interface FeedResponse {
	algorithm: string;
	feeds: FeedItem[];
	next_page: string;
	total: number;
}

const useReadFeedSearchQuery = (
	options: Options,
	queryOptions?: {
		enabled?: boolean;
	}
) => {
	const { query, excludeFollowed = false, sort = FeedSort.Relevance } = options;
	const { enabled = Boolean( query ) } = queryOptions ?? {};

	return useQuery< FeedResponse >( {
		queryKey: [ 'read', 'feed', 'search', query, excludeFollowed, sort ],
		queryFn: async () => {
			if ( query === undefined ) {
				return;
			}

			const urlQuery = {
				q: query,
				exclude_followed: excludeFollowed,
				sort,
			};

			return wpcom.req.get( {
				path: addQueryArgs( '/read/feed', urlQuery ),
				apiVersion: '1.1',
				method: 'GET',
			} );
		},
		enabled,
		refetchOnWindowFocus: false,
	} );
};

export default useReadFeedSearchQuery;
