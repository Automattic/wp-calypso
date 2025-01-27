import React, { createContext, useState, useContext, useMemo } from 'react';
import { SiteSubscriptionsFilterBy, SiteSubscriptionsSortBy } from '../constants';

type SiteSubscriptionsQueryPropsType = {
	searchTerm: string;
	setSearchTerm: ( term: string ) => void;
	sortTerm: SiteSubscriptionsSortBy;
	setSortTerm: ( term: SiteSubscriptionsSortBy ) => void;
	filterOption: SiteSubscriptionsFilterBy;
	setFilterOption: ( option: SiteSubscriptionsFilterBy ) => void;
};

export const SiteSubscriptionsQueryProps = createContext< SiteSubscriptionsQueryPropsType >( {
	searchTerm: '',
	setSearchTerm: () => undefined,
	sortTerm: SiteSubscriptionsSortBy.DateSubscribed,
	setSortTerm: () => undefined,
	filterOption: SiteSubscriptionsFilterBy.All,
	setFilterOption: () => undefined,
} );

type SiteSubscriptionsQueryPropsProviderProps = {
	// initializer for `searchTerm` state, either a value or a callback, a standard initializer arg for `useState`
	initialSearchTermState?: string | ( () => string );
	children: React.ReactNode;
};

export const SiteSubscriptionsQueryPropsProvider = ( {
	initialSearchTermState = '',
	children,
}: SiteSubscriptionsQueryPropsProviderProps ) => {
	const [ searchTerm, setSearchTerm ] = useState( initialSearchTermState );
	const [ sortTerm, setSortTerm ] = useState( SiteSubscriptionsSortBy.DateSubscribed );
	const [ filterOption, setFilterOption ] = useState( SiteSubscriptionsFilterBy.All );

	const value = useMemo(
		() => ( {
			searchTerm,
			setSearchTerm,
			sortTerm,
			setSortTerm,
			filterOption,
			setFilterOption,
		} ),
		[ searchTerm, setSearchTerm, sortTerm, setSortTerm, filterOption, setFilterOption ]
	);
	return (
		<SiteSubscriptionsQueryProps.Provider value={ value }>
			{ children }
		</SiteSubscriptionsQueryProps.Provider>
	);
};

export const useSiteSubscriptionsQueryProps = () => {
	// Allow for usage without enclosing SiteSubscriptionsQueryPropsProvider
	return useContext( SiteSubscriptionsQueryProps );
};
