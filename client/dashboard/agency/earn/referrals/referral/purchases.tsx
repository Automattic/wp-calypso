import { agencyProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useLocale } from '../../../../app/locale';
import { DataViews, DataViewsCard } from '../../../../components/dataviews';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { formatDate } from '../../../../utils/datetime';
import { useReferral } from '../hooks/use-referral';
import { getProductName } from '../lib/get-product-name';
import { getPurchaseTotal } from '../lib/get-purchase-total';
import { getActivePurchases } from '../lib/referral-orders';
import ReferralNotFound from './not-found';
import PurchaseSiteDetails from './purchase-site-details';
import type { ReferralPurchase } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

type PurchaseItem = ReferralPurchase & { _id: string };

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 20,
	titleField: 'product',
	fields: [ 'site', 'date', 'total' ],
};

export default function ReferralPurchases() {
	const locale = useLocale();
	const { referral, agencyId } = useReferral();
	const { data: products } = useQuery( agencyProductsQuery( agencyId ) );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const items = useMemo< PurchaseItem[] >(
		() =>
			( referral ? getActivePurchases( referral ) : [] ).map( ( purchase, index ) => ( {
				...purchase,
				_id: `${ purchase.referral_id }-${ purchase.product_id }-${ index }`,
			} ) ),
		[ referral ]
	);

	const fields = useMemo< Field< PurchaseItem >[] >(
		() => [
			{
				id: 'product',
				label: __( 'Product details' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) => getProductName( item, products ),
			},
			{
				id: 'site',
				label: __( 'Site details' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) => item.site_assigned || item.status,
				render: ( { item } ) => <PurchaseSiteDetails purchase={ item } products={ products } />,
			},
			{
				id: 'date',
				label: __( 'Assigned on' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) =>
					( item.license?.attached_at &&
						formatDate( new Date( item.license.attached_at ), locale ) ) ||
					'—',
			},
			{
				id: 'total',
				label: __( 'Total' ),
				enableHiding: false,
				enableSorting: false,
				getValue: ( { item } ) => getPurchaseTotal( item, products ) ?? '—',
			},
		],
		[ locale, products ]
	);

	const { data: paginatedItems, paginationInfo } = useMemo(
		() => filterSortAndPaginate( items, view, fields ),
		[ items, view, fields ]
	);

	if ( ! referral ) {
		return <ReferralNotFound />;
	}

	return (
		<PageLayout header={ <PageHeader title={ __( 'Purchases' ) } /> }>
			<DataViewsCard>
				<DataViews< PurchaseItem >
					data={ paginatedItems }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					search={ false }
					getItemId={ ( item ) => item._id }
					defaultLayouts={ { table: { titleField: 'product' } } }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
