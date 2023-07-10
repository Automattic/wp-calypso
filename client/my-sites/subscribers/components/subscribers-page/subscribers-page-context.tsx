import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { usePagination } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { SubscribersFilterBy, SubscribersSortBy } from '../../constants';
import { useSubscribersQuery } from '../../queries';

type SubscribersPageProviderProps = {
	siteId: number | undefined;
	filterOption: SubscribersFilterBy;
	pageNumber: number;
	searchTerm: string;
	sortTerm: SubscribersSortBy;
	filterOptionChanged: ( option: SubscribersFilterBy ) => void;
	pageChanged: ( page: number ) => void;
	searchTermChanged: ( term: string ) => void;
	sortTermChanged: ( term: SubscribersSortBy ) => void;
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
	pageChangeCallback: ( page: number ) => void;
	sortTerm: SubscribersSortBy;
	setSortTerm: ( term: SubscribersSortBy ) => void;
	filterOption: SubscribersFilterBy;
	setFilterOption: ( option: SubscribersFilterBy ) => void;
};

const SubscribersPageContext = createContext< SubscribersPageContextProps | undefined >(
	undefined
);

const DEFAULT_PER_PAGE = 10;

export const SubscribersPageProvider = ( {
	children,
	siteId,
	filterOption = SubscribersFilterBy.All,
	pageNumber,
	searchTerm,
	sortTerm = SubscribersSortBy.DateSubscribed,
	filterOptionChanged,
	pageChanged,
	searchTermChanged,
	sortTermChanged,
}: SubscribersPageProviderProps ) => {
	const [ perPage, setPerPage ] = useState( DEFAULT_PER_PAGE );

<<<<<<< HEAD
=======
	const handleSearch = useCallback( ( term: string ) => {
		searchTermChanged( term );
		pageChanged( 1 );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

>>>>>>> 54f64001c4 (Reset page when searching)
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );

	const grandTotalQueryResult = useSubscribersQuery( { siteId } );
	const grandTotal = grandTotalQueryResult.data?.total || 0;

	const subscribersQueryResult = useSubscribersQuery( {
		page: pageNumber,
		perPage,
		search: debouncedSearchTerm,
		siteId,
		sortTerm,
		filterOption,
	} );

	const { pageChangeCallback } = usePagination(
		pageNumber,
		pageChanged,
		subscribersQueryResult.isFetching
	);

	const handleSearch = useCallback( ( term: string ) => {
		searchTermChanged( term );
		pageChangeCallback( 1 );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

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

	return (
		<SubscribersPageContext.Provider
			value={ {
				searchTerm,
				handleSearch,
				page: pageNumber,
				grandTotal,
				total,
				perPage,
				setPerPage,
				subscribers,
				pageChangeCallback,
				sortTerm,
				setSortTerm: sortTermChanged,
				filterOption,
				setFilterOption: filterOptionChanged,
			} }
		>
			{ children }
		</SubscribersPageContext.Provider>
	);
};

export const useSubscribersPage = () => {
	const context = useContext( SubscribersPageContext );
	if ( ! context ) {
		throw new Error( 'useSubscribersPage must be used within a SubscribersPageProvider' );
	}
	return context;
};
