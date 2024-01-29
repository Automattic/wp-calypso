import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { usePagination } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSelector } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SubscribersFilterBy, SubscribersSortBy } from '../../constants';
import useManySubsSite from '../../hooks/use-many-subs-site';
import { useSubscribersQuery } from '../../queries';
import { migrateSubscribers } from './migrate-subscribers-query';

type SubscribersPageProviderProps = {
	siteId: number | null;
	filterOption: SubscribersFilterBy;
	pageNumber: number;
	timestamp: number;
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
	showAddSubscribersModal: boolean;
	showMigrateSubscribersModal: boolean;
	setShowAddSubscribersModal: ( show: boolean ) => void;
	addSubscribersCallback: () => void;
	migrateSubscribersCallback: ( sourceSiteId: number, targetSiteId: number ) => void;
	closeAllModals: typeof closeAllModals;
	siteId: number | null;
	isLoading: boolean;
	pages?: number;
};

const SubscribersPageContext = createContext< SubscribersPageContextProps | undefined >(
	undefined
);

const DEFAULT_PER_PAGE = 10;

function closeAllModals() {
	window.location.hash = '';
}

export const SubscribersPageProvider = ( {
	children,
	siteId,
	filterOption = SubscribersFilterBy.All,
	pageNumber,
	searchTerm,
	timestamp,
	sortTerm = SubscribersSortBy.DateSubscribed,
	filterOptionChanged,
	pageChanged,
	searchTermChanged,
	sortTermChanged,
}: SubscribersPageProviderProps ) => {
	const [ perPage, setPerPage ] = useState( DEFAULT_PER_PAGE );
	const [ showAddSubscribersModal, setShowAddSubscribersModal ] = useState( false );
	const [ showMigrateSubscribersModal, setShowMigrateSubscribersModal ] = useState( false );
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );
	const { hasManySubscribers } = useManySubsSite( siteId );

	useEffect( () => {
		const handleHashChange = () => {
			// Open "add subscribers" via URL hash
			setShowMigrateSubscribersModal( window.location.hash === '#migrate-subscribers' );
		};

		// Listen to the hashchange event
		window.addEventListener( 'hashchange', handleHashChange );

		// Make it work on load as well
		handleHashChange();

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
	}, [] );

	const subscriberType =
		filterOption === SubscribersFilterBy.All && hasManySubscribers
			? SubscribersFilterBy.WPCOM
			: filterOption;

	const dispatch = useDispatch();

	const subscribersQueryResult = useSubscribersQuery( {
		page: pageNumber,
		perPage,
		search: debouncedSearchTerm,
		siteId,
		sortTerm,
		filterOption: subscriberType,
		timestamp,
	} );
	const grandTotal = subscribersQueryResult.data?.total || 0;
	const pages = subscribersQueryResult.data?.pages || 0;

	const { pageChangeCallback } = usePagination(
		pageNumber,
		pageChanged,
		subscribersQueryResult.isFetching
	);

	const queryClient = useQueryClient();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const completeImportSubscribersTask = async () => {
		if ( selectedSiteSlug ) {
			await updateLaunchpadSettings( selectedSiteSlug, {
				checklist_statuses: { import_subscribers: true },
			} );
		}
		queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
	};

	const addSubscribersCallback = () => {
		setShowAddSubscribersModal( false );
		completeImportSubscribersTask();

		dispatch(
			successNotice(
				translate(
					"Your subscriber list is being processed. We'll send you an email when it's finished importing."
				),
				{
					duration: 5000,
				}
			)
		);
	};

	const migrateSubscribersCallback = async ( sourceSiteId: number, targetSiteId: number ) => {
		closeAllModals();
		try {
			const response = await migrateSubscribers( sourceSiteId, targetSiteId );
			if ( response.success ) {
				completeImportSubscribersTask();
				dispatch(
					successNotice(
						translate(
							'Your follower migration has been queued. You will receive an email to indicate when it starts and finishes.'
						),
						{
							duration: 8000,
						}
					)
				);
			} else {
				dispatch(
					errorNotice( response.message, {
						duration: 5000,
					} )
				);
			}
		} catch {
			dispatch(
				errorNotice( translate( 'An unknown error has occurred. Please try again in a second.' ), {
					duration: 5000,
				} )
			);
		}
	};

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
				showAddSubscribersModal,
				showMigrateSubscribersModal,
				setShowAddSubscribersModal,
				closeAllModals,
				addSubscribersCallback,
				migrateSubscribersCallback,
				siteId,
				isLoading: subscribersQueryResult.isLoading,
				pages,
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
