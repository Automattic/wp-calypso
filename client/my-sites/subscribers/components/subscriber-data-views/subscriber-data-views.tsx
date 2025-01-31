import { Gravatar } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, type View, type Action, Operator } from '@wordpress/dataviews';
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import TimeSince from 'calypso/components/time-since';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { useSubscriptionPlans, useUnsubscribeModal } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSelector } from 'calypso/state';
import { getCouponsAndGiftsEnabledForSiteId } from 'calypso/state/memberships/settings/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { SubscribersFilterBy, SubscribersSortBy } from '../../constants';
import { useSubscribersQuery, useSubscriberCountQuery } from '../../queries';
import { SubscriberDetails } from '../subscriber-details';
import { SubscribersHeader } from '../subscribers-header';
import { UnsubscribeModal } from '../unsubscribe-modal';
import './style.scss';

type SubscriberDataViewsProps = {
	siteId: number | undefined;
	isUnverified?: boolean;
	isStagingSite?: boolean;
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
	layout: {
		styles: {
			media: { width: '60px' },
			name: { width: '55%', minWidth: '195px' },
			plan: { width: '25%' },
			date_subscribed: { width: '25%' },
		},
	},
	fields: [ 'name', 'plan', 'date_subscribed' ],
};

const getSubscriberId = ( subscriber: Subscriber ) => subscriber.subscription_id.toString();

const SubscriberDataViews = ( {
	siteId = undefined,
	isUnverified = false,
	isStagingSite = false,
	onGiftSubscription,
}: SubscriberDataViewsProps ) => {
	const isMobile = useBreakpoint( '<660px' );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ filterOption, setFilterOption ] = useState( SubscribersFilterBy.All );
	const [ selectedSubscriber, setSelectedSubscriber ] = useState< Subscriber | null >( null );
	const { isSimple, isAtomic } = useSelector( ( state ) => ( {
		isSimple: isSimpleSite( state ),
		isAtomic: isAtomicSite( state, siteId ),
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
		filterOption,
		limitData: true,
	} );

	const { data: subscribersTotals } = useSubscriberCountQuery( siteId ?? null );
	const grandTotal = subscribersTotals?.email_subscribers ?? 0;
	const {
		subscribers,
		is_owner_subscribed: isOwnerSubscribed,
		pages,
	} = subscribersQueryResult || {
		subscribers: [],
		is_owner_subscribed: false,
		pages: 0,
	};

	const {
		currentSubscriber,
		onClickUnsubscribe: handleUnsubscribe,
		onConfirmModal,
		resetSubscriber,
	} = useUnsubscribeModal(
		siteId ?? null,
		{
			currentPage: currentView.page ?? 1,
			filterOption,
			searchTerm,
			sortTerm: SubscribersSortBy.DateSubscribed,
		},
		false,
		() => {
			setSelectedSubscriber( null );
		}
	);

	const EmptyComponent = isSimple || isAtomic ? SubscriberLaunchpad : EmptyListView;
	const shouldShowLaunchpad =
		! isLoading && ! searchTerm && ( ! grandTotal || ( grandTotal === 1 && isOwnerSubscribed ) );

	const handleSubscriberSelect = useCallback(
		( items: string[] ) => {
			if ( items.length === 0 ) {
				setSelectedSubscriber( null );
				return;
			}
			const selectedId = items[ 0 ];
			const subscriber = subscribers.find(
				( s: Subscriber ) => s.subscription_id.toString() === selectedId
			);
			if ( subscriber ) {
				setSelectedSubscriber( subscriber );
			}
		},
		[ subscribers ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'media',
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
					<button
						type="button"
						onClick={ () => handleSubscriberSelect( [ getSubscriberId( item ) ] ) }
					>
						{ selectedSubscriber ? (
							<SubscriberName displayName={ item.display_name } email={ item.email_address } />
						) : (
							<div className="subscriber-data-views__list-item">
								<div className="subscriber-data-views__list-item-avatar">
									<Gravatar
										user={ { avatar_URL: item.avatar, name: item.display_name } }
										size={ 52 }
										imgSize={ 80 }
										className="subscriber-data-views__square-avatar"
									/>
								</div>
								<SubscriberName displayName={ item.display_name } email={ item.email_address } />
							</div>
						) }
					</button>
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
					{ label: 'Paid', value: SubscribersFilterBy.Paid },
					{ label: 'Free', value: SubscribersFilterBy.Free },
				],
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				enableSorting: true,
				enableHiding: false,
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
		[ handleSubscriberSelect, selectedSubscriber ]
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
						handleSubscriberSelect( [ getSubscriberId( items[ 0 ] ) ] );
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
		handleSubscriberSelect,
		handleUnsubscribe,
		onGiftSubscription,
		couponsAndGiftsEnabled,
	] );

	useEffect( () => {
		// If we're on mobile, we only want to show the name field.
		if ( isMobile ) {
			setCurrentView( ( prevView ) => ( {
				...prevView,
				fields: [ 'name' ],
			} ) );
		} else if ( selectedSubscriber ) {
			// If we're on subscribers page, we want to show the list view.
			setCurrentView( ( prevView ) => ( {
				...prevView,
				type: 'list',
				fields: [ 'media', 'name' ],
				layout: {
					primaryField: 'name',
					mediaField: 'media',
				},
			} ) );
		} else {
			// Otherwise, we want to show the table view.
			setCurrentView( ( prevView ) => ( {
				...prevView,
				...defaultView,
			} ) );
		}
	}, [ isMobile, selectedSubscriber ] );

	useEffect( () => {
		// Handle search term from the view.
		setSearchTerm( currentView.search ?? '' );

		// Handle filter option from the view.
		setFilterOption(
			( currentView.filters?.[ 0 ]?.value as SubscribersFilterBy ) ?? SubscribersFilterBy.All
		);
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
					disableCta={ isUnverified || isStagingSite }
					hideSubtitle={ !! selectedSubscriber }
				/>
				{ shouldShowLaunchpad ? (
					<EmptyComponent />
				) : (
					<DataViews< Subscriber >
						data={ data }
						fields={ fields }
						view={ currentView }
						onChangeView={ setCurrentView }
						selection={
							selectedSubscriber ? [ selectedSubscriber.subscription_id.toString() ] : undefined
						}
						onChangeSelection={ handleSubscriberSelect }
						isLoading={ isLoading }
						paginationInfo={ paginationInfo }
						getItemId={ ( item: Subscriber ) => item.subscription_id.toString() }
						defaultLayouts={ selectedSubscriber ? { list: {} } : { table: {} } }
						actions={ actions }
						search
						searchLabel={ translate( 'Search by name, username or email…' ) }
					/>
				) }
			</section>
			{ selectedSubscriber && siteId && (
				<section className="subscriber-data-views__details">
					<SubscriberDetails
						subscriber={ selectedSubscriber }
						siteId={ siteId }
						subscriptionId={ selectedSubscriber.subscription_id }
						onClose={ () => setSelectedSubscriber( null ) }
						onUnsubscribe={ handleUnsubscribe }
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
