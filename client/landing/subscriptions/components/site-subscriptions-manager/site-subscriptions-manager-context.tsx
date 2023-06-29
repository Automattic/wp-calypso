import { SubscriptionManager, Reader } from '@automattic/data-stores';
import React, { createContext, useState, useCallback, useContext } from 'react';

type SiteSubscriptionsManagerContextProps = {
	searchTerm: string;
	handleSearch: ( term: string ) => void;
	sortTerm: Reader.SiteSubscriptionsSortBy;
	setSortTerm: ( term: Reader.SiteSubscriptionsSortBy ) => void;
	filterOption: Reader.SiteSubscriptionsFilterBy;
	setFilterOption: ( option: Reader.SiteSubscriptionsFilterBy ) => void;
	siteSubscriptionsQueryResult: ReturnType< typeof SubscriptionManager.useSiteSubscriptionsQuery >; // Replace QueryResult with the actual type of the result
};

const SiteSubscriptionsManagerContext = createContext<
	SiteSubscriptionsManagerContextProps | undefined
>( undefined );

export const SiteSubscriptionsManagerProvider: React.FC< { children: React.ReactNode } > = ( {
	children,
} ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const handleSearch = useCallback( ( term: string ) => {
		setSearchTerm( term );
	}, [] );

	const [ sortTerm, setSortTerm ] = useState( Reader.SiteSubscriptionsSortBy.DateSubscribed );
	const [ filterOption, setFilterOption ] = useState( Reader.SiteSubscriptionsFilterBy.All );

	const siteSubscriptionsQueryResult = SubscriptionManager.useSiteSubscriptionsQuery( {
		searchTerm,
		sortTerm,
		filterOption,
	} );

	return (
		<SiteSubscriptionsManagerContext.Provider
			value={ {
				searchTerm,
				handleSearch,
				sortTerm,
				setSortTerm,
				filterOption,
				setFilterOption,
				siteSubscriptionsQueryResult,
			} }
		>
			{ children }
		</SiteSubscriptionsManagerContext.Provider>
	);
};

export const useSiteSubscriptionsManager = () => {
	const context = useContext( SiteSubscriptionsManagerContext );
	if ( ! context ) {
		throw new Error(
			'useSiteSubscriptionsManager must be used within a SiteSubscriptionsManagerProvider'
		);
	}
	return context;
};
