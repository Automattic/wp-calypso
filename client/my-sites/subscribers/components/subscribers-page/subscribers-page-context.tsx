import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { usePagination } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { SubscribersSortBy } from '../../constants';
import { useSubscribersQuery } from '../../queries';

type SubscribersPageProviderProps = {
	siteId: number | null;
	page: number;
	pageChanged: ( page: number ) => void;
	children: React.ReactNode;
};

type SubscribersPageContextProps = {
	searchTerm: string;
	handleSearch: ( term: string ) => void;
	page: number;
	perPage: number;
	setPerPage: ( perPage: number ) => void;
	subscribers: Subscriber[];
	total: number;
	grandTotal: number;
	pageClickCallback: ( page: number ) => void;
	sortTerm: SubscribersSortBy;
	setSortTerm: ( term: SubscribersSortBy ) => void;
};

const SubscribersPageContext = createContext< SubscribersPageContextProps | undefined >(
	undefined
);

const DEFAULT_PER_PAGE = 10;

export const SubscribersPageProvider = ( {
	children,
	siteId,
	page,
	pageChanged,
}: SubscribersPageProviderProps ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ perPage, setPerPage ] = useState( DEFAULT_PER_PAGE );
	const [ sortTerm, setSortTerm ] = useState( SubscribersSortBy.DateSubscribed );

	const handleSearch = useCallback( ( term: string ) => {
		setSearchTerm( term );
	}, [] );

	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );

	const grandTotalQueryResult = useSubscribersQuery( { siteId } );
	const grandTotal = grandTotalQueryResult.data?.total || 0;

	const subscribersQueryResult = useSubscribersQuery( {
		page,
		perPage,
		search: debouncedSearchTerm,
		siteId,
		sortTerm,
	} );

	const { total, per_page, subscribers } = subscribersQueryResult.data || {
		total: 0,
		per_page: DEFAULT_PER_PAGE,
		subscribers: [],
	};

	// If we receive a different perPage value from the query, update the state
	// Could be for example that we set perPage to 500, but the query's max is 100
	useEffect( () => {
		setPerPage( per_page );
	}, [ per_page ] );

	const { pageClickCallback } = usePagination(
		page,
		pageChanged,
		subscribersQueryResult.isFetching
	);

	return (
		<SubscribersPageContext.Provider
			value={ {
				searchTerm,
				handleSearch,
				page,
				grandTotal,
				total,
				perPage,
				setPerPage,
				subscribers,
				pageClickCallback,
				sortTerm,
				setSortTerm,
			} }
		>
			{ children }
		</SubscribersPageContext.Provider>
	);
};

export const useSubscribersPage = () => {
	const context = useContext( SubscribersPageContext );
	if ( ! context ) {
		throw new Error(
			'useSubscribersPage must be used within a SubscribersPageProvider'
		);
	}
	return context;
};
