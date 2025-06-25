import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, ReactNode, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ReferralProducts from './components/referral-products';
import ReferralStatus from './components/referral-status';
import type { ReferralAPIResponse } from '../types';
import type { Action } from 'calypso/a8c-for-agencies/components/list-item-cards';

import './style.scss';

export default function ClientReferrals( {
	referrals,
	isFetchingProducts,
	productsData,
	actions,
}: {
	referrals: ReferralAPIResponse[];
	isFetchingProducts: boolean;
	productsData: APIProductFamilyProduct[] | undefined;
	actions: Action[];
} ) {
	const translate = useTranslate();

	const fields = useMemo(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: () => '-',
				render: ( { item }: { item: ReferralAPIResponse } ): ReactNode => {
					return <ReferralStatus status={ item.status } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'products',
				label: translate( 'Products' ),
				getValue: () => '-',
				render: ( { item }: { item: ReferralAPIResponse } ): ReactNode => (
					<ReferralProducts
						products={ item.products }
						isFetchingProducts={ isFetchingProducts }
						productsData={ productsData }
					/>
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isFetchingProducts, productsData, translate ]
	);

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'status', 'products' ],
	} );

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( referrals, dataViewsState, fields );
	}, [ referrals, dataViewsState, fields ] );

	return (
		<>
			<div className="referrals-details-table__container redesigned-a8c-table">
				<ItemsDataViews
					data={ {
						items: data,
						getItemId: ( item ) => `${ item.id }`,
						fields,
						pagination: paginationInfo,
						enableSearch: false,
						actions,
						dataViewsState: dataViewsState,
						setDataViewsState: setDataViewsState,
						defaultLayouts: { table: {} },
					} }
				/>
			</div>
		</>
	);
}
