import { Purchases } from '@automattic/data-stores';
import { Fields, Operator } from '@wordpress/dataviews';
import { LocalizeProps } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getDisplayName } from 'calypso/lib/purchases';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import {
	PurchaseItemSiteIcon,
	PurchaseItemProduct,
	PurchaseItemStatus,
	PurchaseItemPaymentMethod,
} from '../purchase-item';
import OwnerInfo from '../purchase-item/owner-info';

function PurchaseItemRowProduct( props: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { purchase, translate } = props;
	const site = useSelector( ( state ) => getSite( state, purchase.siteId ?? 0 ) );
	const slug = purchase.siteName ?? purchase.siteId;
	return (
		<PurchaseItemProduct
			purchase={ purchase }
			site={ site }
			translate={ translate }
			slug={ slug }
			showSite
			isDisconnectedSite={ ! site }
		/>
	);
}

function PurchaseItemRowStatus( props: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
	moment: ReturnType< typeof useLocalizedMoment >;
	isJetpack?: boolean;
	isDisconnectedSite?: boolean;
} ) {
	const { purchase, translate, moment, isJetpack, isDisconnectedSite } = props;

	return (
		<div className="purchase-item__status purchases-layout__status">
			<PurchaseItemStatus
				purchase={ purchase }
				translate={ translate }
				moment={ moment }
				isJetpack={ isJetpack }
				isDisconnectedSite={ isDisconnectedSite }
			/>
		</div>
	);
}

function PurchaseItemRowPaymentMethod( props: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { purchase, translate } = props;

	return (
		<div className="purchase-item__payment-method">
			<PurchaseItemPaymentMethod purchase={ purchase } translate={ translate } />
		</div>
	);
}

export function getPurchasesFieldDefinitions( {
	translate,
	moment,
}: {
	translate: LocalizeProps[ 'translate' ];
	moment: ReturnType< typeof useLocalizedMoment >;
} ): Fields< Purchases.Purchase > {
	return [
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
				return (
					<div className="purchase-item__information purchases-layout__information">
						<div className="purchase-item__title">
							{ getDisplayName( item ) }
							&nbsp;
							<OwnerInfo purchase={ item } />
						</div>
						<div className="purchase-item__purchase-type">
							<PurchaseItemRowProduct purchase={ item } translate={ translate } />
						</div>
					</div>
				);
			},
		},
		{
			id: 'status',
			label: 'status',
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				return item.expiryStatus;
			},
			render: ( { item }: { item: Purchases.Purchase } ) => {
				return (
					<PurchaseItemRowStatus purchase={ item } translate={ translate } moment={ moment } />
				);
			},
		},
		{
			id: 'payment-method',
			label: 'Payment method',
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				return item.payment;
			},
			render: ( { item }: { item: Purchases.Purchase } ) => {
				return <PurchaseItemRowPaymentMethod purchase={ item } translate={ translate } />;
			},
		},
	];
}
