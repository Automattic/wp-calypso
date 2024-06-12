import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import StatusBadge from 'calypso/a8c-for-agencies/sections/referrals/common/step-section-item/status-badge';
import useFetchClientSubscriptions from '../../hooks/use-fetch-client-subscriptions';
import { getSubscriptionStatus } from '../../lib/get-subscription-status';
import type { Subscription } from '../../types';

import './style.scss';

export default function SubscriptionsList() {
	const translate = useTranslate();
	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

	const { data, isFetching } = useFetchClientSubscriptions();
	const { data: products, isFetching: isFetchingProducts } = useProductsQuery( true );

	const title = translate( 'Your subscriptions' );

	const fields = useMemo(
		() => [
			{
				id: 'purchase',
				header: translate( 'Purchase' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					const product = products?.find( ( product ) => product.product_id === item.product_id );
					return isFetchingProducts ? <TextPlaceholder /> : product?.name;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'price',
				header: translate( 'Price' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					const product = products?.find( ( product ) => product.product_id === item.product_id );
					return isFetchingProducts ? <TextPlaceholder /> : `$${ product?.amount }`;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'subscription-status',
				header: translate( 'Subscription Status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					const { children, type } = getSubscriptionStatus( item.status, translate );
					return children ? <StatusBadge statusProps={ { children, type } } /> : '-';
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				header: translate( 'Actions' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Subscription } ): ReactNode => {
					const status = item.status;
					const isActive = status === 'active';
					return isActive ? (
						<Button compact>{ translate( 'Cancel the subscription' ) }</Button>
					) : (
						'-'
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isFetchingProducts, products, translate ]
	);

	return (
		<Layout
			className="subscriptions-list__layout"
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
				<div className="redesigned-a8c-table">
					<ItemsDataViews
						data={ {
							items: data || [],
							pagination: {
								totalItems: 1,
								totalPages: 1,
							},
							itemFieldId: 'id',
							enableSearch: false,
							fields: fields,
							actions: [],
							setDataViewsState: setDataViewsState,
							dataViewsState: dataViewsState,
						} }
						isLoading={ isFetching }
					/>
				</div>
			</LayoutBody>
		</Layout>
	);
}
