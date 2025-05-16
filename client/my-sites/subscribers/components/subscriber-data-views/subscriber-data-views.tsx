import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gravatar, TimeSince } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, type View, type ViewTable, type Action, Operator } from '@wordpress/dataviews';
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { trash } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useSubscribedNewsletterCategories } from 'calypso/data/newsletter-categories';
import { useSelector, useDispatch } from 'calypso/state';
import { getCouponsAndGiftsEnabledForSiteId } from 'calypso/state/memberships/settings/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isSimpleSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { SubscribersFilterBy, SubscribersSortBy, SubscribersStatus } from '../../constants';
import { getSubscriptionIdFromSubscriber } from '../../helpers';
import { useSubscriptionPlans, useUnsubscribeModal } from '../../hooks';
import {
	useSubscribersQuery,
	useSubscriberCountQuery,
	useSubscriberDetailsQuery,
} from '../../queries';
import {
	useRecordSubscriberClicked,
	useRecordSubscriberSearch,
	useRecordSubscriberFilter,
	useRecordSubscriberSort,
} from '../../tracks';
import { Subscriber } from '../../types';
import { JetpackEmptyListView } from '../jetpack-empty-list-view';
import { SubscriberDetails } from '../subscriber-details';
import { SubscriberDetailsSkeleton } from '../subscriber-details/skeleton';
import { SubscriberLaunchpad } from '../subscriber-launchpad';
import SubscriberTotals from '../subscriber-totals';
import { SubscribersHeader } from '../subscribers-header';
import { UnsubscribeModal } from '../unsubscribe-modal';
import './style.scss';

type SubscriberDataViewsProps = {
	siteId: number | null;
	isUnverified: boolean;
	onGiftSubscription: ( subscriber: Subscriber ) => void;
	subscriberId?: string;
};

const SubscriptionTypeCell = ( { subscriber }: { subscriber: Subscriber } ) => {
	const plans = useSubscriptionPlans( subscriber );
	return plans.map( ( plan, index ) => <div key={ index }>{ plan.plan }</div> );
};

const SubscriberName = ( { displayName, email }: { displayName: string; email: string } ) => (
	<div className="subscriber-profile subscriber-profile--compact">
		<div className="subscriber-profile__user-details">
			<span className="subscriber-profile__name">{ displayName }</span>
			{ email !== displayName && <span className="subscriber-profile__email">{ email }</span> }
		</div>
	</div>
);

const useNewHelper = config.isEnabled( 'subscribers-helper-library' );

const getSubscriptionId = ( subscriber: Subscriber ): number => {
	return Number( getSubscriptionIdFromSubscriber( subscriber ) );
};

const getSubscriptionIdString = ( subscriber: Subscriber ): string => {
	return String( getSubscriptionIdFromSubscriber( subscriber ) );
};

const getSubscriptionDate = ( subscriber: Subscriber ): string => {
	if ( useNewHelper ) {
		return subscriber.wpcom_date_subscribed || subscriber.email_date_subscribed || '';
	}
	return subscriber.date_subscribed || '';
};

const defaultView: ViewTable = {
	type: 'table',
	titleField: 'name',
	mediaField: 'media',
	showTitle: true,
	showMedia: true,
	fields: [ 'plan', 'subscription_status', 'date_subscribed' ],
	layout: {
		styles: {
			media: { width: '60px' },
			name: { width: '55%', minWidth: '195px' },
			plan: { width: '15%' },
			subscription_status: { width: '15%' },
			date_subscribed: { width: '15%' },
		},
	},
};

export default function SubscriberDataViews( {
	siteId,
	onGiftSubscription,
	isUnverified,
	subscriberId,
}: SubscriberDataViewsProps ) {
	const dispatch = useDispatch();
	const isMobile = useBreakpoint( '<660px' );
	const recordSubscriberClicked = useRecordSubscriberClicked();
	const recordSubscriberSearch = useRecordSubscriberSearch();
	const recordSubscriberFilter = useRecordSubscriberFilter();
	const recordSubscriberSort = useRecordSubscriberSort();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isSimple = useSelector( ( state ) => isSimpleSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isStaging = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ filters, setFilters ] = useState< SubscribersFilterBy[] >( [ SubscribersFilterBy.All ] );
	const [ selectedSubscriber, setSelectedSubscriber ] = useState< Subscriber | null >( null );

	const couponsAndGiftsEnabled = useSelector( ( state ) =>
		getCouponsAndGiftsEnabledForSiteId( state, siteId )
	);

	const [ currentView, setCurrentView ] = useState< View >( {
		...defaultView,
		page: 1,
		perPage: 10,
		sort: {
			field: SubscribersSortBy.DateSubscribed,
			direction: 'desc',
		},
	} );

	const { data: subscribersQueryResult, isLoading } = useSubscribersQuery( {
		siteId: siteId ?? null,
		page: currentView.page,
		perPage: currentView.perPage,
		search: searchTerm,
		sortTerm: currentView.sort?.field as SubscribersSortBy,
		sortOrder: currentView.sort?.direction as 'asc' | 'desc',
		filters: filters,
	} );

	const {
		currentSubscribers,
		onSetUnsubscribers: handleUnsubscribe,
		onConfirmModal,
		resetSubscribers,
	} = useUnsubscribeModal(
		siteId ?? null,
		{
			page: currentView.page ?? 1,
			perPage: currentView.perPage,
			search: searchTerm,
			sortTerm: currentView.sort?.field as SubscribersSortBy,
			sortOrder: currentView.sort?.direction as 'asc' | 'desc',
			filters: filters,
		},
		false,
		() => {
			page.show( `/subscribers/${ siteSlug }` );
		}
	);

	// Fetch subscriber details.
	const { data: subscriberDetails, isLoading: isLoadingDetails } = useSubscriberDetailsQuery(
		siteId ?? null,
		// Only pass subscriberId if it's a valid number
		subscriberId && ! isNaN( parseInt( subscriberId, 10 ) )
			? parseInt( subscriberId, 10 )
			: undefined,
		undefined // We only need the subscriberId to fetch details
	);

	const { data: subscribedNewsletterCategoriesData, isLoading: isLoadingNewsletterCategories } =
		useSubscribedNewsletterCategories( {
			siteId: siteId as number,
			subscriptionId:
				subscriberId && ! isNaN( parseInt( subscriberId, 10 ) )
					? parseInt( subscriberId, 10 )
					: undefined,
			userId: subscriberDetails?.user_id,
			enabled: !! subscriberId && !! siteId,
		} );

	// Single effect to handle all subscriber selection scenarios
	useEffect( () => {
		// If no subscriberId in URL, immediately clear selection
		if ( ! subscriberId ) {
			setSelectedSubscriber( null );
			return;
		}

		// If we have details and they match the current URL, use them
		if ( subscriberDetails && subscriberId === getSubscriptionIdString( subscriberDetails ) ) {
			setSelectedSubscriber( subscriberDetails );
		}
		// Don't clear selectedSubscriber - let it keep showing the previous subscriber while loading
		// The SubscriberDetailsSkeleton will show because subscriberDetails won't match subscriberId
	}, [ subscriberId, subscriberDetails ] );

	const { data: subscribersTotals } = useSubscriberCountQuery( siteId ?? null );
	const grandTotal = subscribersTotals?.email_subscribers ?? 0;
	const {
		subscribers,
		is_owner_subscribed: isOwnerSubscribed,
		pages,
		total,
	} = subscribersQueryResult || {
		subscribers: [],
		is_owner_subscribed: false,
		pages: 0,
		total: 0,
	};

	const EmptyComponent = isSimple || isAtomic ? SubscriberLaunchpad : JetpackEmptyListView;
	const shouldShowLaunchpad =
		! isLoading && ! searchTerm && ( ! grandTotal || ( grandTotal === 1 && isOwnerSubscribed ) );

	/**
	 * Read page from URL when component mounts or URL changes.
	 *
	 * URL Parameters:
	 * - /subscribers/{siteSlug}/{subscriberId} - View specific subscriber
	 * - ?page={number} - Navigate to specific page (preserved across views)
	 */
	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const pageFromUrl = urlParams.get( 'page' );
		if ( pageFromUrl && ! isNaN( parseInt( pageFromUrl, 10 ) ) ) {
			setCurrentView( ( prev ) => ( {
				...prev,
				page: parseInt( pageFromUrl, 10 ),
			} ) );
		}
	}, [] );

	const handleSubscriberSelection = useCallback(
		( input: Subscriber | string[] ) => {
			if ( Array.isArray( input ) ) {
				if ( input.length === 0 ) {
					setSelectedSubscriber( null );
					page.show( `/subscribers/${ siteSlug }` );
					return;
				}
				const subscriber = subscribersQueryResult?.subscribers.find(
					( s ) => getSubscriptionIdString( s ) === input[ 0 ]
				);
				if ( subscriber ) {
					recordSubscriberClicked( 'list', {
						site_id: siteId,
						subscription_id: getSubscriptionId( subscriber ),
						user_id: subscriber.user_id,
					} );
					page.show(
						`/subscribers/${ siteSlug }/${ getSubscriptionIdString( subscriber ) }?page=${
							currentView.page
						}`
					);
				}
			} else {
				recordSubscriberClicked( 'row', {
					site_id: siteId,
					subscription_id: getSubscriptionId( input ),
					user_id: input.user_id,
				} );
				page.show(
					`/subscribers/${ siteSlug }/${ getSubscriptionIdString( input ) }?page=${
						currentView.page
					}`
				);
			}
		},
		[
			subscribersQueryResult?.subscribers,
			recordSubscriberClicked,
			siteId,
			siteSlug,
			currentView.page,
		]
	);

	// Modify the onClose handler to clear selection before navigation
	const handleClose = useCallback( () => {
		setSelectedSubscriber( null );
		const urlParams = new URLSearchParams( window.location.search );
		const pageParam = urlParams.get( 'page' );
		if ( pageParam ) {
			page.show( `/subscribers/${ siteSlug }?page=${ pageParam }` );
		} else {
			page.show( `/subscribers/${ siteSlug }` );
		}
	}, [ siteSlug ] );

	const fields = useMemo(
		() => [
			{
				id: 'media',
				label: translate( 'Media' ),
				getValue: ( { item }: { item: Subscriber } ) => item.avatar,
				render: ( { item }: { item: Subscriber } ) => (
					<Gravatar
						user={ { avatar_URL: item.avatar, name: item.display_name } }
						size={ 40 }
						imgSize={ 80 }
						className="subscriber-data-views__square-avatar"
					/>
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'name',
				label: translate( 'Name' ),
				getValue: ( { item }: { item: Subscriber } ) => item.display_name,
				render: ( { item }: { item: Subscriber } ) => (
					<SubscriberName displayName={ item.display_name } email={ item.email_address } />
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'plan',
				label: translate( 'Subscription type' ),
				getValue: ( { item }: { item: Subscriber } ) =>
					item.plans?.length ? SubscribersFilterBy.Paid : SubscribersFilterBy.Free,
				render: ( { item }: { item: Subscriber } ) => <SubscriptionTypeCell subscriber={ item } />,
				elements: [
					{ label: translate( 'Paid' ), value: SubscribersFilterBy.Paid },
					{ label: translate( 'Free' ), value: SubscribersFilterBy.Free },
				],
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'subscription_status',
				label: translate( 'Email subscription' ),
				getValue: ( { item }: { item: Subscriber } ) => item.subscription_status,
				render: ( { item }: { item: Subscriber } ) => (
					<div>
						{ SubscribersStatus[ item.subscription_status as keyof typeof SubscribersStatus ] ??
							item.subscription_status }
					</div>
				),
				elements: [
					{
						label: SubscribersStatus[ 'Subscribed' ],
						value: SubscribersFilterBy.EmailSubscriber,
					},
					{
						label: SubscribersStatus[ 'Not subscribed' ],
						value: SubscribersFilterBy.ReaderSubscriber,
					},
					{
						label: SubscribersStatus[ 'Not confirmed' ],
						value: SubscribersFilterBy.UnconfirmedSubscriber,
					},
					{
						label: SubscribersStatus[ 'Not sending' ],
						value: SubscribersFilterBy.BlockedSubscriber,
					},
				],
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'date_subscribed',
				label: translate( 'Since' ),
				getValue: ( { item }: { item: Subscriber } ) => getSubscriptionDate( item ),
				render: ( { item }: { item: Subscriber } ) => (
					<TimeSince date={ getSubscriptionDate( item ) } />
				),
				enableHiding: false,
				enableSorting: true,
			},
		],
		[]
	);

	const actions = useMemo< Action< Subscriber >[] >( () => {
		// If we're in list view (when a subscriber is selected), return empty actions array.
		if ( selectedSubscriber ) {
			return [];
		}

		const baseActions = [
			{
				id: 'view',
				label: translate( 'View' ),
				callback: ( items: Subscriber[] ) => {
					if ( items[ 0 ] ) {
						handleSubscriberSelection( items[ 0 ] );
					}
				},
				isPrimary: true,
			},
			{
				id: 'remove',
				label: translate( 'Remove' ),
				callback: handleUnsubscribe,
				isPrimary: false,
				supportsBulk: true,
				icon: trash,
			},
		];

		if ( couponsAndGiftsEnabled ) {
			baseActions.push( {
				id: 'gift',
				label: translate( 'Gift a subscription' ),
				callback: ( items: Subscriber[] ) => {
					const subscriber = items[ 0 ];
					if ( ! subscriber ) {
						return;
					}

					if ( ! subscriber.user_id ) {
						dispatch(
							errorNotice(
								translate(
									'This subscriber needs to create a WordPress.com account before they can receive a gift subscription.'
								),
								{ duration: 10000 }
							)
						);
						return;
					}

					onGiftSubscription( subscriber );
				},
				isPrimary: false,
			} );
		}

		return baseActions;
	}, [
		selectedSubscriber,
		handleSubscriberSelection,
		handleUnsubscribe,
		onGiftSubscription,
		couponsAndGiftsEnabled,
		dispatch,
	] );

	const handleViewChange = useCallback(
		( newView: View ) => {
			// Track search changes.
			if ( newView.search !== currentView.search && newView.search ) {
				recordSubscriberSearch( { site_id: siteId, query: newView.search } );
			}

			// Track filter changes.
			const newFilters = newView.filters?.filter( Boolean ) ?? [];
			const currentFilters = currentView.filters?.filter( Boolean ) ?? [];
			if ( JSON.stringify( newFilters ) !== JSON.stringify( currentFilters ) ) {
				newFilters.forEach( ( filter ) => {
					if ( filter?.value ) {
						const field = fields.find( ( f ) => f.id === filter.field );
						const element = field?.elements?.find( ( e ) => e.value === filter.value );
						recordSubscriberFilter( {
							site_id: siteId,
							filter: filter.value as SubscribersFilterBy,
							filter_field: filter.field,
							filter_label: element?.label ?? '',
						} );
					}
				} );
			}

			// Track sort changes.
			if (
				newView.sort?.field !== currentView.sort?.field ||
				newView.sort?.direction !== currentView.sort?.direction
			) {
				recordSubscriberSort( {
					site_id: siteId,
					sort_field: newView.sort?.field as SubscribersSortBy,
					sort_direction: newView.sort?.direction as 'asc' | 'desc',
				} );
			}

			// Update URL when page changes
			if ( newView.page !== currentView.page ) {
				const currentPath = window.location.pathname;
				const urlParams = new URLSearchParams( window.location.search );
				urlParams.set( 'page', String( newView.page ) );
				page.show( `${ currentPath }?${ urlParams.toString() }` );
			}

			setCurrentView( newView );
		},
		[
			currentView,
			recordSubscriberSearch,
			recordSubscriberFilter,
			recordSubscriberSort,
			siteId,
			fields,
		]
	);

	useEffect( () => {
		// If we're on mobile, we only want to show the name field.
		if ( isMobile ) {
			setCurrentView( ( prevView ) => ( {
				...prevView,
				showMedia: false,
				fields: [],
			} ) );
		} else if ( selectedSubscriber ) {
			// If we're on subscribers page, we want to show the list view (name & media).
			setCurrentView( ( prevView ) => ( {
				...prevView,
				type: 'list',
				showTitle: true,
				showMedia: true,
				fields: [],
			} ) );
		} else {
			// Otherwise, we want to show the table view.
			setCurrentView( ( prevView ) => ( {
				...prevView,
				...defaultView,
				layout: defaultView.layout,
			} ) );
		}
	}, [ isMobile, selectedSubscriber ] );

	useEffect( () => {
		// Handle search term from the view.
		setSearchTerm( currentView.search ?? '' );

		// Handle filter option from the view.
		const filterValues =
			( currentView.filters
				// Filter out undefined values to prevent unnecessary queries.
				?.filter( ( filter ) => filter.value !== undefined )
				.map( ( filter ) => filter.value ) as SubscribersFilterBy[] ) ?? [];
		setFilters( filterValues.length ? filterValues : [ SubscribersFilterBy.All ] );
	}, [ currentView.search, currentView.filters ] );

	// Memoize the data and pagination info.
	const { data, paginationInfo } = useMemo( () => {
		return {
			data: subscribers,
			paginationInfo: {
				totalItems: grandTotal,
				totalPages: pages,
			},
		};
	}, [ subscribers, grandTotal, pages ] );

	return (
		<div
			className={ `subscriber-data-views ${ selectedSubscriber ? 'has-selected-subscriber' : '' }` }
		>
			<section className="subscriber-data-views__list">
				<SubscribersHeader
					selectedSiteId={ siteId || undefined }
					disableCta={ isUnverified || isStaging }
					hideSubtitle={ !! selectedSubscriber }
					hideAddButtonLabel={ isMobile || !! selectedSubscriber }
				/>
				{ shouldShowLaunchpad ? (
					<EmptyComponent />
				) : (
					<>
						<SubscriberTotals
							totalSubscribers={ grandTotal }
							filteredCount={ total }
							filters={ filters }
							searchTerm={ searchTerm }
							isLoading={ isLoading }
						/>
						<DataViews< Subscriber >
							data={ data }
							fields={ fields }
							view={ currentView }
							onClickItem={ handleSubscriberSelection }
							isItemClickable={ () => true }
							onChangeView={ handleViewChange }
							selection={
								selectedSubscriber ? [ getSubscriptionIdString( selectedSubscriber ) ] : undefined
							}
							onChangeSelection={
								currentView.type === 'list' ? handleSubscriberSelection : undefined
							}
							isLoading={ isLoading }
							paginationInfo={ paginationInfo }
							getItemId={ ( item: Subscriber ) => getSubscriptionIdString( item ) }
							defaultLayouts={ selectedSubscriber ? { list: {} } : { table: {} } }
							actions={ actions }
							search
							searchLabel={ translate( 'Search subscribers…' ) }
						/>
					</>
				) }
			</section>
			{ subscriberId && siteId && (
				<section className="subscriber-data-views__details">
					{ isLoadingNewsletterCategories ||
					isLoadingDetails ||
					! subscriberDetails ||
					getSubscriptionIdString( subscriberDetails ) !== subscriberId ? (
						<SubscriberDetailsSkeleton />
					) : (
						<SubscriberDetails
							subscriber={ subscriberDetails }
							siteId={ siteId }
							subscriptionId={ getSubscriptionId( subscriberDetails ) }
							onClose={ handleClose }
							onUnsubscribe={ ( subscriber ) => handleUnsubscribe( [ subscriber ] ) }
							newsletterCategoriesEnabled={ subscribedNewsletterCategoriesData?.enabled }
							newsletterCategories={ subscribedNewsletterCategoriesData?.newsletterCategories }
						/>
					) }
				</section>
			) }
			<UnsubscribeModal
				subscribers={ currentSubscribers }
				onCancel={ resetSubscribers }
				onConfirm={ onConfirmModal }
			/>
		</div>
	);
}
