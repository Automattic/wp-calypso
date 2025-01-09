import { useBreakpoint } from '@automattic/viewport-react';
import { DataViews } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import TimeSince from 'calypso/components/time-since';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { SubscriberProfile } from 'calypso/my-sites/subscribers/components/subscriber-profile';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { useSubscriptionPlans } from 'calypso/my-sites/subscribers/hooks';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { SubscribersSortBy } from '../../constants';
import type { View, Field, Action } from '@wordpress/dataviews';
import './style.scss';

const SubscriptionTypeCell = ( { subscriber }: { subscriber: Subscriber } ) => {
	const plans = useSubscriptionPlans( subscriber );
	return (
		<>
			{ plans.map( ( plan, index ) => (
				<div key={ index }>{ plan.plan }</div>
			) ) }
		</>
	);
};

type SubscriberDataViewsProps = {
	siteId: number | null;
	onClickView: ( subscriber: Subscriber ) => void;
	onClickUnsubscribe: ( subscriber: Subscriber ) => void;
	onGiftSubscription: ( subscriber: Subscriber ) => void;
};

const SubscriberDataViews = ( {
	siteId,
	onClickView,
	onClickUnsubscribe,
}: SubscriberDataViewsProps ) => {
	const translate = useTranslate();
	const isMobile = useBreakpoint( '<1040px' );
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
		setSortTerm,
	} = useSubscribersPage();

	const isSimple = useSelector( isSimpleSite );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const EmptyComponent = isSimple || isAtomic ? SubscriberLaunchpad : EmptyListView;
	const shouldShowLaunchpad =
		! isLoading && ! searchTerm && ( ! grandTotal || ( grandTotal === 1 && isOwnerSubscribed ) );

	const fields = useMemo< Field< Subscriber >[] >( () => {
		const baseFields = [
			{
				id: 'name',
				label: translate( 'Name' ),
				getValue: ( { item }: { item: Subscriber } ) => item.display_name,
				render: ( { item }: { item: Subscriber } ) => (
					<button onClick={ () => onClickView( item ) }>
						<SubscriberProfile
							avatar={ item.avatar }
							displayName={ item.display_name }
							email={ item.email_address }
							url={ item.url }
						/>
					</button>
				),
				enableHiding: false,
				enableSorting: true,
			},
		];

		if ( ! isMobile ) {
			baseFields.push(
				{
					id: 'subscription_type',
					label: translate( 'Subscription type' ),
					getValue: ( { item }: { item: Subscriber } ) => ( item.plans?.length ? 'Paid' : 'Free' ),
					render: ( { item }: { item: Subscriber } ) => (
						<SubscriptionTypeCell subscriber={ item } />
					),
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
				}
			);
		}

		return baseFields;
	}, [ translate, onClickView, isMobile ] );

	const actions = useMemo< Action< Subscriber >[] >(
		() => [
			{
				id: 'view',
				label: translate( 'View' ),
				callback: ( items: Subscriber[] ) => onClickView( items[ 0 ] ),
				isPrimary: true,
			},
			{
				id: 'remove',
				label: translate( 'Remove' ),
				callback: ( items: Subscriber[] ) => onClickUnsubscribe( items[ 0 ] ),
			},
		],
		[ translate, onClickView, onClickUnsubscribe ]
	);

	const handleViewChange = ( newView: View ) => {
		if ( typeof newView.page === 'number' && newView.page !== page ) {
			pageChangeCallback( newView.page );
		}

		if ( typeof newView.perPage === 'number' && newView.perPage !== perPage ) {
			setPerPage( newView.perPage );
			pageChangeCallback( 1 );
		}

		if ( typeof newView.search === 'string' && newView.search !== searchTerm ) {
			handleSearch( newView.search );
		}

		if ( newView.sort?.field ) {
			const newSortTerm =
				newView.sort.field === 'name' ? SubscribersSortBy.Name : SubscribersSortBy.DateSubscribed;
			if ( newSortTerm !== sortTerm ) {
				setSortTerm( newSortTerm );
			}
		}
	};

	const currentView = useMemo< View >(
		() => ( {
			type: 'table',
			layout: {},
			search: searchTerm,
			page,
			perPage,
			sort: {
				field: sortTerm === SubscribersSortBy.Name ? 'name' : 'date_subscribed',
				direction: 'desc',
			},
		} ),
		[ searchTerm, page, perPage, sortTerm ]
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

	return (
		<section className="subscriber-data-views">
			{ shouldShowLaunchpad ? (
				<EmptyComponent />
			) : (
				<DataViews< Subscriber >
					data={ data }
					fields={ fields }
					view={ currentView }
					onChangeView={ handleViewChange }
					isLoading={ isLoading }
					paginationInfo={ paginationInfo }
					getItemId={ ( item: Subscriber ) => item.subscription_id.toString() }
					defaultLayouts={ { table: {} } }
					actions={ actions }
					search
					searchLabel={ translate( 'Search by name, username or email…' ) }
				/>
			) }
		</section>
	);
};

export default SubscriberDataViews;
