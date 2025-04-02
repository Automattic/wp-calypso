import page from '@automattic/calypso-router';
import { Gravatar, TimeSince } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, type View, type Action, Operator } from '@wordpress/dataviews';
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { trash } from '@wordpress/icons';
import { translate, fixMe } from 'i18n-calypso';
import { useSubscribedNewsletterCategories } from 'calypso/data/newsletter-categories';
import { useSelector, useDispatch } from 'calypso/state';
import { getCouponsAndGiftsEnabledForSiteId } from 'calypso/state/memberships/settings/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SubscribersFilterBy, SubscribersSortBy, SubscribersStatus } from '../../constants';
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

const defaultView: View = {
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

const SubscriberDataViews = ( {
	siteId,
	onGiftSubscription,
	isUnverified,
	subscriberId,
}: SubscriberDataViewsProps ) => {
	const dispatch = useDispatch();
	const isMobile = useBreakpoint( '<660px' );
	const recordSubscriberClicked = useRecordSubscriberClicked();
	const recordSubscriberSearch = useRecordSubscriberSearch();
	const recordSubscriberFilter = useRecordSubscriberFilter();
	const recordSubscriberSort = useRecordSubscriberSort();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ filters, setFilters ] = useState< SubscribersFilterBy[] >( [ SubscribersFilterBy.All ] );
	const [ selectedSubscriber, setSelectedSubscriber ] = useState< Subscriber | null >( null );
	const { isSimple, isAtomic, isStaging } = useSelector( ( state ) => ( {
		isSimple: isSimpleSite( state ),
		isAtomic: isAtomicSite( state, siteId ),
		isStaging: isSiteWpcomStaging( state, siteId ),
	} ) );
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
		subscriberId ? parseInt( subscriberId, 10 ) : undefined,
		selectedSubscriber?.user_id
	);

	// Single effect to handle all subscriber selection scenarios
	useEffect( () => {
		// If URL changes or we get new subscriber details, update the selection
		if ( subscriberId ) {
			// If we have details and they match the current URL
			if ( subscriberDetails && subscriberDetails.subscription_id.toString() === subscriberId ) {
				setSelectedSubscriber( subscriberDetails );
			}
			// If we don't have matching details yet, try to find in current list
			else {
				const subscriberFromList = subscribersQueryResult?.subscribers.find(
					( s ) => s.subscription_id.toString() === subscriberId
				);
				if ( subscriberFromList ) {
					setSelectedSubscriber( subscriberFromList );
				}
			}
		} else if ( ! subscriberId && selectedSubscriber ) {
			setSelectedSubscriber( null );
		}
		// We don't need to re-run this effect when selectedSubscriber changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ subscriberId, subscriberDetails, subscribersQueryResult?.subscribers ] );

	const { data: subscribedNewsletterCategoriesData, isLoading: isLoadingNewsletterCategories } =
		useSubscribedNewsletterCategories( {
			siteId: siteId as number,
			subscriptionId: selectedSubscriber?.subscription_id,
			userId: selectedSubscriber?.user_id,
			enabled: !! selectedSubscriber,
		} );

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

	const handleSubscriberSelection = useCallback(
		( input: Subscriber | string[] ) => {
			if ( Array.isArray( input ) ) {
				if ( input.length === 0 ) {
					setSelectedSubscriber( null );
					page.show( `/subscribers/${ siteSlug }` );
					return;
				}
				const subscriber = subscribers.find( ( s ) => s.subscription_id.toString() === input[ 0 ] );
				if ( subscriber ) {
					recordSubscriberClicked( 'list', {
						site_id: siteId,
						subscription_id: subscriber.subscription_id,
						user_id: subscriber.user_id,
					} );
					page.show( `/subscribers/${ siteSlug }/${ subscriber.subscription_id }` );
				}
			} else {
				recordSubscriberClicked( 'row', {
					site_id: siteId,
					subscription_id: input.subscription_id,
					user_id: input.user_id,
				} );
				page.show( `/subscribers/${ siteSlug }/${ input.subscription_id }` );
			}
		},
		[ subscribers, recordSubscriberClicked, siteId, siteSlug ]
	);

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
				label: fixMe( {
					text: 'Subscription Type',
					newCopy: translate( 'Subscription Type' ),
					oldCopy: translate( 'Plan' ),
				} ) as string,
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
				getValue: ( { item }: { item: Subscriber } ) => item.date_subscribed,
				render: ( { item }: { item: Subscriber } ) => <TimeSince date={ item.date_subscribed } />,
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
								selectedSubscriber ? [ selectedSubscriber.subscription_id.toString() ] : undefined
							}
							onChangeSelection={
								currentView.type === 'list' ? handleSubscriberSelection : undefined
							}
							isLoading={ isLoading }
							paginationInfo={ paginationInfo }
							getItemId={ ( item: Subscriber ) => item.subscription_id.toString() }
							defaultLayouts={ selectedSubscriber ? { list: {} } : { table: {} } }
							actions={ actions }
							search
							searchLabel={ translate( 'Search subscribers…' ) }
						/>
					</>
				) }
			</section>
			{ selectedSubscriber &&
				siteId &&
				! isLoadingNewsletterCategories &&
				! isLoadingDetails &&
				subscriberDetails && (
					<section className="subscriber-data-views__details">
						<SubscriberDetails
							subscriber={ subscriberDetails }
							siteId={ siteId }
							subscriptionId={ selectedSubscriber.subscription_id }
							onClose={ () => {
								page.show( `/subscribers/${ siteSlug }` );
							} }
							onUnsubscribe={ ( subscriber ) => handleUnsubscribe( [ subscriber ] ) }
							newsletterCategoriesEnabled={ subscribedNewsletterCategoriesData?.enabled }
							newsletterCategories={ subscribedNewsletterCategoriesData?.newsletterCategories }
						/>
					</section>
				) }
			<UnsubscribeModal
				subscribers={ currentSubscribers }
				onCancel={ resetSubscribers }
				onConfirm={ onConfirmModal }
			/>
		</div>
	);
};

export default SubscriberDataViews;
