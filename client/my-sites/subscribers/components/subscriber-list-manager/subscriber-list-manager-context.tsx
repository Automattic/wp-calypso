import { Reader } from '@automattic/data-stores';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { usePagination } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSubscribersQuery } from '../../queries';

type SubscriberListManagerProviderProps = {
	siteId: number | null;
	page: number;
	pageChanged: ( page: number ) => void;
	children: React.ReactNode;
};

type SubscriberListManagerContextProps = {
	searchTerm: string;
	handleSearch: ( term: string ) => void;
	page: number;
	perPage: number;
	setPerPage: ( perPage: number ) => void;
	subscribers: Subscriber[];
	total: number;
	grandTotal: number;
	pageClickCallback: ( page: number ) => void;
	sortTerm: Reader.SubscribersSortBy;
	setSortTerm: ( term: Reader.SubscribersSortBy ) => void;
};

const SubscriberListManagerContext = createContext< SubscriberListManagerContextProps | undefined >(
	undefined
);

const DEFAULT_PER_PAGE = 10;

export const SubscribersListManagerProvider = ( {
	children,
	siteId,
	page,
	pageChanged,
}: SubscriberListManagerProviderProps ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ perPage, setPerPage ] = useState( DEFAULT_PER_PAGE );
	const [ sortTerm, setSortTerm ] = useState( Reader.SubscribersSortBy.DateSubscribed );

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
		<SubscriberListManagerContext.Provider
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
		</SubscriberListManagerContext.Provider>
	);
};

export const useSubscriberListManager = () => {
	const context = useContext( SubscriberListManagerContext );
	if ( ! context ) {
		throw new Error(
			'useSubscriberListManager must be used within a SubscribersListManagerProvider'
		);
	}
	return context;
};
