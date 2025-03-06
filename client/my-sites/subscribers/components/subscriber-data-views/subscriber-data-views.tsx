import { Gravatar, TimeSince } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { Tooltip } from '@wordpress/components';
import { DataViews, type View, type Action, Operator } from '@wordpress/dataviews';
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { useSubscribedNewsletterCategories } from 'calypso/data/newsletter-categories';
import { useSelector } from 'calypso/state';
import { getCouponsAndGiftsEnabledForSiteId } from 'calypso/state/memberships/settings/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { SubscribersFilterBy, SubscribersSortBy } from '../../constants';
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
import { EmptyListView } from '../empty-list-view';
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
	fields: [ 'plan', 'is_email_subscriber', 'date_subscribed' ],
	layout: {
		styles: {
			media: { width: '60px' },
			name: { width: '55%', minWidth: '195px' },
			plan: { width: '15%' },
			is_email_subscriber: { width: '15%' },
			date_subscribed: { width: '15%' },
		},
	},
};

const SubscriberDataViews = ( {
	siteId,
	onGiftSubscription,
	isUnverified,
}: SubscriberDataViewsProps ) => {
	const isMobile = useBreakpoint( '<660px' );
	const recordSubscriberClicked = useRecordSubscriberClicked();
	const recordSubscriberSearch = useRecordSubscriberSearch();
	const recordSubscriberFilter = useRecordSubscriberFilter();
	const recordSubscriberSort = useRecordSubscriberSort();

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
		currentSubscriber,
		onClickUnsubscribe: handleUnsubscribe,
		onConfirmModal,
		resetSubscriber,
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
			setSelectedSubscriber( null );
		}
	);

	const { data: subscriber, isLoading: isLoadingDetails } = useSubscriberDetailsQuery(
		siteId ?? null,
		selectedSubscriber?.subscription_id,
		selectedSubscriber?.user_id
	);

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

	const EmptyComponent = isSimple || isAtomic ? SubscriberLaunchpad : EmptyListView;
	const shouldShowLaunchpad =
		! isLoading && ! searchTerm && ( ! grandTotal || ( grandTotal === 1 && isOwnerSubscribed ) );

	const handleSubscriberSelection = useCallback(
		( input: Subscriber | string[] ) => {
			if ( Array.isArray( input ) ) {
				if ( input.length === 0 ) {
					setSelectedSubscriber( null );
					return;
				}
				const subscriber = subscribers.find( ( s ) => s.subscription_id.toString() === input[ 0 ] );
				if ( subscriber ) {
					recordSubscriberClicked( 'list', {
						site_id: siteId,
						subscription_id: subscriber.subscription_id,
						user_id: subscriber.user_id,
					} );
					setSelectedSubscriber( subscriber );
				}
			} else {
				recordSubscriberClicked( 'row', {
					site_id: siteId,
					subscription_id: input.subscription_id,
					user_id: input.user_id,
				} );
				setSelectedSubscriber( input );
			}
		},
		[ subscribers, recordSubscriberClicked, siteId ]
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
				label: translate( 'Plan' ),
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
				id: 'is_email_subscriber',
				label: translate( 'Email subscriber' ),
				getValue: ( { item }: { item: Subscriber } ) => ( item.is_email_subscriber ? 'yes' : 'no' ),
				render: ( { item }: { item: Subscriber } ) => {
					const noTooltip = (
						<Tooltip text={ translate( 'Reader only subscriber' ) }>
							<span className="subscriber-data-views__tooltip-text">{ translate( 'No' ) }</span>
						</Tooltip>
					);

					return <div>{ item.is_email_subscriber ? translate( 'Yes' ) : noTooltip }</div>;
				},
				elements: [
					{ label: translate( 'True' ), value: SubscribersFilterBy.EmailSubscriber },
					{
						label: translate( 'False' ),
						value: SubscribersFilterBy.ReaderSubscriber,
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
				callback: ( items: Subscriber[] ) => handleUnsubscribe( items[ 0 ] ),
				isPrimary: false,
			},
		];

		if ( couponsAndGiftsEnabled ) {
			baseActions.push( {
				id: 'gift',
				label: translate( 'Gift a subscription' ),
				callback: ( items: Subscriber[] ) => {
					if ( items[ 0 ] && items[ 0 ].user_id ) {
						onGiftSubscription( items[ 0 ] );
					}
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
		recordSubscriberClicked,
		siteId,
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
							onChangeView={ handleViewChange }
							selection={
								selectedSubscriber ? [ selectedSubscriber.subscription_id.toString() ] : undefined
							}
							onChangeSelection={ handleSubscriberSelection }
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
				subscriber && (
					<section className="subscriber-data-views__details">
						<SubscriberDetails
							subscriber={ subscriber }
							siteId={ siteId }
							subscriptionId={ selectedSubscriber.subscription_id }
							onClose={ () => setSelectedSubscriber( null ) }
							onUnsubscribe={ handleUnsubscribe }
							newsletterCategoriesEnabled={ subscribedNewsletterCategoriesData?.enabled }
							newsletterCategories={ subscribedNewsletterCategoriesData?.newsletterCategories }
						/>
					</section>
				) }
			<UnsubscribeModal
				subscriber={ currentSubscriber }
				onCancel={ resetSubscriber }
				onConfirm={ onConfirmModal }
			/>
		</div>
	);
};

export default SubscriberDataViews;
