import { Purchases } from '@automattic/data-stores';
import { Fields, Operator } from '@wordpress/dataviews';
import { LocalizeProps } from 'i18n-calypso';
import { getDisplayName } from 'calypso/lib/purchases';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { PurchaseItemSiteIcon, PurchaseItemProduct } from '../purchase-item';
import OwnerInfo from '../purchase-item/owner-info';

function PurchaseItemRowProduct( props: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { purchase, translate } = props;
	const site = useSelector( ( state ) => getSite( state, purchase.siteId ?? 0 ) );
	const slug = purchase.siteName ?? purchase.siteId;
	// Need to figure out how to pass translate here
	return (
		<>
			<div className="purchase-item__information purchases-layout__information">
				<div className="purchase-item__title">
					{ getDisplayName( purchase ) }
					&nbsp;
					<OwnerInfo purchase={ purchase } />
				</div>
				<div className="purchase-item__purchase-type">
					<PurchaseItemProduct
						purchase={ purchase }
						site={ site }
						translate={ translate }
						slug={ slug }
						showSite
						isDisconnectedSite={ ! site }
					/>
				</div>
			</div>
		</>
	);
}

export function getPurchasesFieldDefinitions(
	// purchases: Purchases.Purchase[],
	translate: LocalizeProps[ 'translate' ]
): Fields< Purchases.Purchase > {
	return [
		{
			id: 'product',
			label: 'Product',
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				return item.productId;
			},
			render: ( { item }: { item: Purchases.Purchase } ) => {
				return <PurchaseItemRowProduct purchase={ item } translate={ translate } />;
			},
		},
		{
			id: 'site',
			label: 'Site',
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			// Filter by site ID
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				return item.siteId;
			},
			// Render the site icon
			render: ( { item }: { item: Purchases.Purchase } ) => {
				const site = { ID: item.siteId };
				return <PurchaseItemSiteIcon site={ site } purchase={ item } />;
			},
		},
	];
}
