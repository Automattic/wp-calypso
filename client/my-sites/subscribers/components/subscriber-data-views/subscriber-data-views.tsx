import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import TimeSince from 'calypso/components/time-since';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import type { View, Field, Action } from '@wordpress/dataviews';
import './style.scss';

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
	} = useSubscribersPage();

	const isSimple = useSelector( isSimpleSite );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const EmptyComponent = isSimple || isAtomic ? SubscriberLaunchpad : EmptyListView;
	const shouldShowLaunchpad =
		! isLoading && ! searchTerm && ( ! grandTotal || ( grandTotal === 1 && isOwnerSubscribed ) );

	const fields = useMemo< Field< Subscriber >[] >(
		() => [
			{
				id: 'name',
				label: translate( 'Name' ),
				getValue: ( { item }: { item: Subscriber } ) => item.display_name,
				render: ( { item }: { item: Subscriber } ) => (
					<button onClick={ () => onClickView( item ) }>
						{ item.display_name || item.email_address }
					</button>
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'subscription_type',
				label: translate( 'Subscription type' ),
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
		[ translate, onClickView ]
	);

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

	const currentView = useMemo< View >(
		() => ( {
			type: 'table',
			layout: {},
			search: searchTerm,
			page,
			perPage,
			sort: { field: 'date_subscribed', direction: 'desc' },
		} ),
		[ searchTerm, page, perPage ]
	);

	const handleViewChange = ( newView: View ) => {
		if ( typeof newView.page === 'number' && newView.page !== page ) {
			pageChangeCallback( newView.page );
		}

		if ( typeof newView.perPage === 'number' && newView.perPage !== perPage ) {
			setPerPage( newView.perPage );
			pageChangeCallback( 1 );
		}
	};

	const { data, paginationInfo } = useMemo( () => {
		const result = filterSortAndPaginate< Subscriber >(
			subscribers,
			{
				...currentView,
				page: 1,
				perPage: subscribers.length,
			},
			fields
		);

		return {
			data: result.data,
			paginationInfo: {
				totalItems: grandTotal,
				totalPages: pages ?? 0,
			},
		};
	}, [ subscribers, currentView, fields, grandTotal, pages ] );

	return (
		<section className="subscriber-data-views">
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
			{ shouldShowLaunchpad && <EmptyComponent /> }
		</section>
	);
};

export default SubscriberDataViews;
