import React, { createContext, useState, useContext } from 'react';
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

export const SiteSubscriptionsQueryPropsProvider: React.FC< { children: React.ReactNode } > = ( {
	children,
} ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ sortTerm, setSortTerm ] = useState( SiteSubscriptionsSortBy.DateSubscribed );
	const [ filterOption, setFilterOption ] = useState( SiteSubscriptionsFilterBy.All );

	return (
		<SiteSubscriptionsQueryProps.Provider
			value={ {
				searchTerm,
				setSearchTerm,
				sortTerm,
				setSortTerm,
				filterOption,
				setFilterOption,
			} }
		>
			{ children }
		</SiteSubscriptionsQueryProps.Provider>
	);
};

export const useSiteSubscriptionsQueryProps = () => {
	// Allow for usage without enclosing SiteSubscriptionsQueryPropsProvider
	return useContext( SiteSubscriptionsQueryProps );
};
