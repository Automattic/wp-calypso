import { fetchReadFeedSearch, ReadFeedSearchSort } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

interface Options {
	query?: string;
	excludeFollowed?: boolean;
	sort?: ReadFeedSearchSort;
}

export const readFeedSearchQuery = ( options: Options ) => {
	const { query, excludeFollowed, sort } = options;
	return queryOptions( {
		queryKey: [ 'read', 'feed', 'search', query, excludeFollowed, sort ],
		queryFn: () => fetchReadFeedSearch( { query, excludeFollowed, sort } ),
		enabled: Boolean( query ),
	} );
};
