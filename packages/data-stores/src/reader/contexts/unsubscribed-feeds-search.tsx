import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import useReadFeedSearchQuery, { FeedItem } from '../queries/use-read-feed-search-query';
import { useSiteSubscriptionsQueryProps } from './site-subscriptions-query-props';

type UnsubscribedFeedsSearch = {
	feedItems: FeedItem[];
	searchQueryResult: ReturnType< typeof useReadFeedSearchQuery >;
};

const UnsubscribedFeedsSearchContext = createContext< UnsubscribedFeedsSearch | undefined >(
	undefined
);

export const UnsubscribedFeedsSearchProvider: React.FC< { children: ReactNode } > = ( {
	children,
} ) => {
	const { searchTerm } = useSiteSubscriptionsQueryProps();
	const searchQueryResult = useReadFeedSearchQuery( { query: searchTerm, excludeFollowed: true } );
	const feedItems = useMemo( () => {
		if ( searchTerm === '' ) {
			return [];
		}
		return searchQueryResult.data?.pages?.[ 0 ]?.feeds || [];
	}, [ searchTerm, searchQueryResult.data?.pages ] );

	return (
		<UnsubscribedFeedsSearchContext.Provider value={ { feedItems, searchQueryResult } }>
			{ children }
		</UnsubscribedFeedsSearchContext.Provider>
	);
};

export const useUnsubscribedFeedsSearch = () => {
	return useContext( UnsubscribedFeedsSearchContext );
};
