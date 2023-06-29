import { Railcar } from '@automattic/calypso-analytics';
import { useInfiniteQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

type FetchReadFeedSearchType = {
	query: string;
	excludeFollowed: boolean;
	sort: string;
};

type FeedItem = {
	URL: string;
	blog_ID: string;
	feed_ID: string;
	meta: {
		links: {
			feed: string;
			site: string;
		};
	};
	railcar: Railcar;
	subscribe_URL: string;
	subscribers_count: number;
	title: string;
};

type FeedResponse = {
	algorithm: string;
	feeds: FeedItem[];
	next_page: string;
	total: number;
};

const useReadFeedSearch = ( { query, excludeFollowed, sort }: FetchReadFeedSearchType ) => {
	return useInfiniteQuery(
		[ 'readFeedSearch', query, excludeFollowed, sort ],
		async ( { pageParam } ) => {
			// The below uses concat only because I believe it makes it easier to comprehend the structure of the query
			const urlQuery = `q=${ encodeURIComponent( query ) }`
				.concat( `&exclude_followed=${ excludeFollowed }` )
				.concat( `&sort=${ encodeURIComponent( sort ) }` )
				.concat( pageParam ? `&${ pageParam }` : '' );
			const response = await wpcomRequest< FeedResponse >( {
				path: '/read/feed',
				apiVersion: '1.1',
				method: 'GET',
				query: urlQuery,
			} );
			return response;
		},
		{
			getNextPageParam: ( lastPage ) => lastPage.next_page,
		}
	);
};

export default useReadFeedSearch;
