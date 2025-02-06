import { isEnabled } from '@automattic/calypso-config';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { ImportSubscribersError } from '@automattic/data-stores/src/subscriber/types';
import { useActiveJobRecognition } from '@automattic/subscriber';
import { useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { usePagination } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSelector } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SubscribersFilterBy, SubscribersSortBy } from '../../constants';
import useManySubsSite from '../../hooks/use-many-subs-site';
import { useSubscriberCountQuery, useSubscribersQuery } from '../../queries';
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
	sortOrder?: 'asc' | 'desc';
	setSortTerm: ( term: SubscribersSortBy ) => void;
	setSortOrder: ( order: 'asc' | 'desc' ) => void;
	filterOption: SubscribersFilterBy;
	setFilterOption: ( option: SubscribersFilterBy ) => void;
	showAddSubscribersModal: boolean;
	showMigrateSubscribersModal: boolean;
	setShowAddSubscribersModal: ( show: boolean ) => void;
	addSubscribersCallback: ( importError?: ImportSubscribersError ) => void;
	migrateSubscribersCallback: ( sourceSiteId: number, targetSiteId: number ) => void;
	closeAllModals: typeof closeAllModals;
	siteId: number | null;
	isLoading: boolean;
	pages?: number;
	isOwnerSubscribed: boolean;
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
	const { hasManySubscribers } = useManySubsSite( siteId );
	const isDataView = isEnabled( 'subscribers-dataviews' );
	const [ perPage, setPerPage ] = useState( DEFAULT_PER_PAGE );
	const [ sortOrder, setSortOrder ] = useState< 'asc' | 'desc' >();
	const [ dataViewSortTerm, setDataViewSortTerm ] = useState< SubscribersSortBy >(
		SubscribersSortBy.DateSubscribed
	);
	const [ dataViewFilterOption, setDataViewFilterOption ] = useState< SubscribersFilterBy >(
		SubscribersFilterBy.All
	);
	const [ showAddSubscribersModal, setShowAddSubscribersModal ] = useState( false );
	const [ showMigrateSubscribersModal, setShowMigrateSubscribersModal ] = useState( false );
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );
	const isJetpackNonAtomic = useSelector(
		( state ) => siteId && isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	useEffect( () => {
		if ( hasManySubscribers ) {
			setDataViewFilterOption( SubscribersFilterBy.WPCOM );
		}
	}, [ hasManySubscribers ] );

	const { completedJob } = useActiveJobRecognition( siteId ?? 0 );

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
		sortTerm: isDataView ? dataViewSortTerm : sortTerm,
		sortOrder,
		filterOption: isDataView ? dataViewFilterOption : subscriberType,
		timestamp,
	} );
	const pages = subscribersQueryResult.data?.pages || 0;

	// Current user is not included in the subscribers list, so we need to remove from the total
	const { data: subscribersTotals } = useSubscriberCountQuery( siteId );

	const grandTotal = subscribersTotals?.email_subscribers ?? 0;

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

	const addSubscribersCallback = ( importError?: ImportSubscribersError ) => {
		setShowAddSubscribersModal( false );
		completeImportSubscribersTask();

		if ( ! importError ) {
			if ( completedJob ) {
				const { email_count, subscribed_count, already_subscribed_count, failed_subscribed_count } =
					completedJob;
				dispatch(
					successNotice(
						translate(
							'Import completed. %(added)d subscribed, %(skipped)d already subscribed, and %(failed)d failed out of %(total)d %(totalLabel)s.',
							{
								args: {
									added: subscribed_count,
									skipped: already_subscribed_count,
									failed: failed_subscribed_count,
									total: email_count,
									totalLabel: translate( 'subscriber', 'subscribers', {
										count: email_count,
									} ),
								},
							}
						)
					)
				);
			} else {
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
			}
		} else {
			let notice = translate( 'An unknown error has occurred. Please try again in a second.' );
			interface NoticeArgs {
				isPersistent: boolean;
				button?: string;
				href?: string;
			}
			const noticeArgs: NoticeArgs = { isPersistent: true };

			if (
				'error' in importError &&
				typeof importError.error === 'object' &&
				importError.error &&
				'code' in importError.error &&
				'message' in importError.error
			) {
				const { code, message } = importError.error;
				notice = message as string;
				if ( code === 'subscriber_import_limit_reached' && typeof message === 'string' ) {
					noticeArgs.button = translate( 'Upgrade' );
					const siteSlug = selectedSiteSlug || ''; // Use a default if siteSlug is not available
					noticeArgs.href = isJetpackNonAtomic
						? `https://cloud.jetpack.com/pricing/${ siteSlug }`
						: `https://wordpress.com/plans/${ siteSlug }`;
				}
			}

			dispatch( errorNotice( notice, noticeArgs ) );
		}
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
							'Your subscriber migration has been queued. You will receive an email to indicate when it starts and finishes.'
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

	const { total, per_page, subscribers, is_owner_subscribed } = subscribersQueryResult.data || {
		total: 0,
		per_page: DEFAULT_PER_PAGE,
		subscribers: [],
		is_owner_subscribed: false,
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
				sortTerm: isDataView ? dataViewSortTerm : sortTerm,
				setSortTerm: isDataView ? setDataViewSortTerm : sortTermChanged,
				sortOrder,
				setSortOrder,
				filterOption: isDataView ? dataViewFilterOption : subscriberType,
				setFilterOption: isDataView ? setDataViewFilterOption : filterOptionChanged,
				showAddSubscribersModal,
				showMigrateSubscribersModal,
				setShowAddSubscribersModal,
				closeAllModals,
				addSubscribersCallback,
				migrateSubscribersCallback,
				siteId,
				isLoading: subscribersQueryResult.isLoading,
				pages,
				isOwnerSubscribed: is_owner_subscribed,
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
