import { Gravatar } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews, type View, type Action } from '@wordpress/dataviews';
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import TimeSince from 'calypso/components/time-since';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { useSubscriptionPlans, useUnsubscribeModal } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSelector } from 'calypso/state';
import { getCouponsAndGiftsEnabledForSiteId } from 'calypso/state/memberships/settings/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { SubscribersSortBy } from '../../constants';
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

const SubscriberDataViews = ( {
	siteId = undefined,
	isUnverified = false,
	isStagingSite = false,
	onGiftSubscription,
}: SubscriberDataViewsProps ) => {
	const translate = useTranslate();
	const isMobile = useBreakpoint( '<660px' );
	const [ selectedSubscriber, setSelectedSubscriber ] = useState< Subscriber | null >( null );
	const couponsAndGiftsEnabled = useSelector( ( state ) =>
		getCouponsAndGiftsEnabledForSiteId( state, siteId )
	);

	const {
		grandTotal,
		page,
		pageChangeCallback,
		searchTerm,
		isLoading,
		subscribers,
		pages,
		isOwnerSubscribed,
		perPage,
		setPerPage,
		handleSearch,
		sortTerm,
		sortOrder,
		setSortTerm,
		setSortOrder,
	} = useSubscribersPage();

	const [ currentView, setCurrentView ] = useState< View >( {
		type: 'table',
		layout: {},
		page,
		perPage,
		sort: {
			field: sortTerm,
			direction: 'desc',
		},
	} );

	const pageArgs = {
		currentPage: page,
		filterOption: undefined,
		searchTerm,
		sortTerm,
	};

	const {
		currentSubscriber,
		onClickUnsubscribe: handleUnsubscribe,
		onConfirmModal,
		resetSubscriber,
	} = useUnsubscribeModal( siteId ?? null, pageArgs, false, () => {
		setSelectedSubscriber( null );
	} );

	const isSimple = useSelector( isSimpleSite );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
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

	const getSubscriberId = useCallback(
		( subscriber: Subscriber ) => subscriber.subscription_id.toString(),
		[]
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
				id: 'subscription_type',
				label: translate( 'Subscription type' ),
				getValue: ( { item }: { item: Subscriber } ) => ( item.plans?.length ? 'Paid' : 'Free' ),
				render: ( { item }: { item: Subscriber } ) => <SubscriptionTypeCell subscriber={ item } />,
				enableHiding: false,
				enableSorting: false,
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
		[ getSubscriberId, handleSubscriberSelect, selectedSubscriber, translate ]
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
		translate,
		handleSubscriberSelect,
		getSubscriberId,
		handleUnsubscribe,
		onGiftSubscription,
		couponsAndGiftsEnabled,
	] );

	const handleViewChange = useCallback(
		( newView: View ) => {
			// Handle pagination
			if ( typeof newView.page === 'number' && newView.page !== page ) {
				pageChangeCallback( newView.page );
			}

			// Handle per page
			if ( typeof newView.perPage === 'number' && newView.perPage !== perPage ) {
				setPerPage( newView.perPage );
				pageChangeCallback( 1 );
			}

			// Handle search
			if ( typeof newView.search === 'string' && newView.search !== searchTerm ) {
				handleSearch( newView.search );
			}

			// Handle sort field change
			if (
				newView.sort?.field &&
				newView.sort.field !== currentView.sort?.field &&
				Object.values( SubscribersSortBy ).includes( newView.sort.field as SubscribersSortBy )
			) {
				setSortTerm( newView.sort.field as SubscribersSortBy );
			}

			// Handle sort order change
			if ( newView.sort?.direction && newView.sort.direction !== currentView.sort?.direction ) {
				setSortOrder( newView.sort.direction );
			}

			// Handle field order change
			if ( newView.fields && newView.fields !== currentView.fields ) {
				setCurrentView( ( oldCurrentView ) => ( {
					...oldCurrentView,
					fields: newView.fields,
				} ) );
			}
		},
		[
			page,
			perPage,
			searchTerm,
			pageChangeCallback,
			setPerPage,
			handleSearch,
			setSortTerm,
			setSortOrder,
			currentView,
		]
	);

	const { data, paginationInfo } = useMemo( () => {
		return {
			data: subscribers,
			paginationInfo: {
				totalItems: grandTotal,
				totalPages: pages ?? 0,
			},
		};
	}, [ subscribers, grandTotal, pages ] );

	// Update the view when a subscriber is selected
	useEffect( () => {
		const commonViewProps = {
			page,
			perPage,
			sort: {
				field: sortTerm,
				direction: sortOrder,
			},
		};

		setCurrentView( ( oldCurrentView ) => {
			const baseView = {
				...oldCurrentView,
				...commonViewProps,
			};

			if ( selectedSubscriber ) {
				return {
					...baseView,
					type: 'list',
					fields: [ 'media', 'name' ],
					layout: {
						primaryField: 'name',
						mediaField: 'media',
					},
				} as View;
			}

			return {
				...baseView,
				type: 'table',
				fields: [ 'name', ...( ! isMobile ? [ 'subscription_type', 'date_subscribed' ] : [] ) ],
				layout: {
					styles: {
						media: { width: '60px' },
						name: { width: '55%', minWidth: '195px' },
						subscription_type: { width: '25%' },
						date_subscribed: { width: '25%' },
					},
				},
			} as View;
		} );
	}, [ isMobile, selectedSubscriber, page, perPage, sortTerm, sortOrder ] );

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
						onChangeView={ handleViewChange }
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
