import React, { createContext, useContext, ReactNode, useState, useMemo } from 'react';
import useReadFeedSearchQuery, { FeedItem } from '../queries/use-read-feed-search-query';

type FeedSearch = {
	searchQuery: string;
	setSearchQuery: ( query: string ) => void;
	feedItems: FeedItem[];
	searchQueryResult: ReturnType< typeof useReadFeedSearchQuery >;
};

const ReadFeedSearchContext = createContext< FeedSearch | undefined >( undefined );

type ReadFeedSearchProviderProps = {
	children: ReactNode;
};

export const ReadFeedSearchProvider: React.FC< ReadFeedSearchProviderProps > = ( { children } ) => {
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const searchQueryResult = useReadFeedSearchQuery( { query: searchQuery, excludeFollowed: true } );
	const feedItems = useMemo( () => {
		if ( searchQuery === '' ) {
			return [];
		}
		return searchQueryResult.data?.pages?.[ 0 ]?.feeds || [];
	}, [ searchQuery, searchQueryResult.data?.pages ] );

	return (
		<ReadFeedSearchContext.Provider
			value={ { searchQuery, setSearchQuery, feedItems, searchQueryResult } }
		>
			{ children }
		</ReadFeedSearchContext.Provider>
	);
};

export const useReadFeedSearch = () => {
	return useContext( ReadFeedSearchContext );
};
