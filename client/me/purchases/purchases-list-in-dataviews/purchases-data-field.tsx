import { Purchases } from '@automattic/data-stores';
import { Fields, Operator } from '@wordpress/dataviews';
import { LocalizeProps } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import { getDisplayName, isRenewing } from 'calypso/lib/purchases';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import {
	PurchaseItemSiteIcon,
	PurchaseItemProduct,
	PurchaseItemStatus,
	PurchaseItemPaymentMethod,
	BackupPaymentMethodNotice,
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

export function getPurchasesFieldDefinitions( {
	translate,
	moment,
	paymentMethods,
}: {
	translate: LocalizeProps[ 'translate' ];
	moment: ReturnType< typeof useLocalizedMoment >;
	paymentMethods: Array< StoredPaymentMethod >;
} ): Fields< Purchases.Purchase > {
	const backupPaymentMethods = paymentMethods.filter(
		( paymentMethod ) => paymentMethod.is_backup === true
	);

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
				return item.payment.storedDetailsId;
			},
			render: ( { item }: { item: Purchases.Purchase } ) => {
				let isBackupMethodAvailable = false;

				if ( backupPaymentMethods ) {
					const backupPaymentMethodsWithoutCurrentPurchase = backupPaymentMethods.filter(
						// A payment method is only a back up if it isn't already assigned to the current purchase
						( paymentMethod ) => item.payment.storedDetailsId !== paymentMethod.stored_details_id
					);

					isBackupMethodAvailable = backupPaymentMethodsWithoutCurrentPurchase.length >= 1;
				}

				return (
					<div className="purchase-item__payment-method">
						<PurchaseItemPaymentMethod purchase={ item } translate={ translate } />
						{ isBackupMethodAvailable && isRenewing( item ) && <BackupPaymentMethodNotice /> }
					</div>
				);
			},
		},
	];
}
