import { fetchReadFeed, fetchReadFeedSearch, ReadFeedSearchSort } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readFeedQuery = ( feedId?: number | string ) => {
	return queryOptions( {
		queryKey: [ 'read', 'feeds', Number( feedId ) ],
		queryFn: () => fetchReadFeed( feedId! ),
		enabled: feedId != null && Number.isInteger( Number( feedId ) ) && Number( feedId ) >= 0,
	} );
};
interface Options {
	query?: string;
	excludeFollowed?: boolean;
	sort?: ReadFeedSearchSort;
}

export const readFeedSearchQuery = ( options: Options ) => {
	const { query, excludeFollowed, sort } = options;
	return queryOptions( {
		queryKey: [ 'read', 'feeds', 'search', query, excludeFollowed, sort ],
		queryFn: () => fetchReadFeedSearch( { query, excludeFollowed, sort } ),
		enabled: Boolean( query ),
	} );
};
