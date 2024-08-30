import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useState, useCallback } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useFetchClientProducts from 'calypso/a8c-for-agencies/data/client/use-fetch-client-products';
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

	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

	const { data, isFetching, refetch } = useFetchClientSubscriptions();
	const { data: products, isFetching: isFetchingProducts } = useFetchClientProducts();

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
					return <SubscriptionPurchase isFetching={ isFetchingProducts } name={ product?.name } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'price',
				label: translate( 'Price' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					const product = products?.find( ( product ) => product.product_id === item.product_id );
					return <SubscriptionPrice isFetching={ isFetchingProducts } amount={ product?.amount } />;
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
		[ isFetchingProducts, onCancelSubscription, products, translate ]
	);

	const { data: items, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( data, dataViewsState, fields );
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
