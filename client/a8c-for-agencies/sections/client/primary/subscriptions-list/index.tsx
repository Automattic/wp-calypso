import { Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useState, useCallback } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useFetchClientProducts from 'calypso/a8c-for-agencies/data/client/use-fetch-client-products';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, { LayoutHeaderTitle as Title } from 'calypso/layout/hosting-dashboard/header';
import { useSelector } from 'calypso/state';
import { getUserBillingType } from 'calypso/state/a8c-for-agencies/agency/selectors';
import useFetchClientSubscriptions from '../../hooks/use-fetch-client-subscriptions';
import {
	SubscriptionAction,
	SubscriptionPrice,
	SubscriptionPurchase,
	SubscriptionStatus,
} from './field-content';
import SubscriptionsListMobileView from './mobile-view';
import type { Subscription } from '../../types';

import './style.scss';

export default function SubscriptionsList() {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'purchase', 'price', 'subscription-status', 'actions' ],
	} );

	const { data, isFetching, refetch } = useFetchClientSubscriptions();
	const { data: products, isFetching: isFetchingProducts } = useFetchClientProducts();
	const isBillingTypeBD = useSelector( getUserBillingType ) === 'billingdragon';

	const title = translate( 'Your subscriptions' );

	const onCancelSubscription = useCallback( () => {
		refetch();
	}, [ refetch ] );

	const fields = useMemo(
		() => [
			{
				id: 'purchase',
				label: translate( 'Purchase' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					const product = products?.find( ( product ) => product.product_id === item.product_id );
					const isPressable = product?.slug.startsWith( 'pressable' );
					const name =
						isBillingTypeBD && item.subscription?.product_name
							? item.subscription.product_name
							: product?.name;
					return (
						<SubscriptionPurchase
							isFetching={ isFetchingProducts }
							name={ name }
							isPressable={ isPressable }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'price',
				label: translate( 'Price' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					if ( isBillingTypeBD && item.status === 'error' ) {
						return <Gridicon icon="minus" />;
					}
					let amount = '';
					let currency = 'USD';
					let interval = 'month';
					if ( isBillingTypeBD ) {
						amount = item.subscription?.purchase_price || '';
						currency = item.subscription?.purchase_currency || '';
						interval = item.subscription?.billing_interval_unit || '';
					} else {
						const product = products?.find( ( product ) => product.product_id === item.product_id );
						amount = product?.amount || '';
					}
					return (
						<SubscriptionPrice
							isFetching={ isFetchingProducts }
							amount={ amount }
							currency={ currency }
							interval={ interval }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'subscription-status',
				label: translate( 'Subscription Status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					return <SubscriptionStatus status={ item.status } translate={ translate } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				label: translate( 'Actions' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					return (
						<SubscriptionAction
							subscription={ item }
							onCancelSubscription={ onCancelSubscription }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isBillingTypeBD, isFetchingProducts, onCancelSubscription, products, translate ]
	);
	const { data: items, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data ?? [], dataViewsState, fields );
	}, [ data, dataViewsState, fields ] );

	return (
		<Layout
			className={ clsx( 'subscriptions-list__layout full-width-layout-with-table', {
				'is-mobile-view': ! isDesktop,
			} ) }
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
			withBorder
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				{ isDesktop ? (
					<div className="redesigned-a8c-table">
						<ItemsDataViews
							data={ {
								items,
								pagination: paginationInfo,
								itemFieldId: 'id',
								enableSearch: false,
								fields: fields,
								actions: [],
								setDataViewsState: setDataViewsState,
								dataViewsState: dataViewsState,
								defaultLayouts: { table: {} },
							} }
							isLoading={ isFetching }
						/>
					</div>
				) : (
					<SubscriptionsListMobileView
						subscriptions={ data }
						title={ title }
						onCancelSubscription={ onCancelSubscription }
						isFetchingProducts={ isFetchingProducts }
						products={ products }
					/>
				) }
			</LayoutBody>
		</Layout>
	);
}
