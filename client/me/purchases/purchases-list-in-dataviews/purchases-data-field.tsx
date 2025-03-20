import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { Purchases } from '@automattic/data-stores';
import { Fields, Operator } from '@wordpress/dataviews';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import PurchaseItem from '../purchase-item';

function PurchaseItemRow( props: { purchase: Purchases.Purchase } ) {
	const purchase = props.purchase;
	const site = useSelector( ( state ) => getSite( state, purchase.siteId ?? 0 ) );

	const paymentMethodsState = useStoredPaymentMethods( { type: 'card', expired: true } );
	const cards = paymentMethodsState.paymentMethods;

	const isBackupMethodAvailable = cards.some(
		( card ) => card.stored_details_id !== purchase.payment.storedDetailsId && card.is_backup
	);

	return (
		<PurchaseItem
			getManagePurchaseUrlFor={ managePurchase }
			key={ purchase.id }
			slug={ purchase.siteName }
			isDisconnectedSite={ ! site }
			purchase={ purchase }
			isJetpack={ isJetpackPlan( purchase ) || isJetpackProduct( purchase ) }
			site={ site }
			showSite /* Renders a button and few subscriptions */
			name={ purchase.siteName }
			isBackupMethodAvailable={ isBackupMethodAvailable }
		/>
	);
}

export const purchasesDataFields = [
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
		getValue: ( { item }: { item: Purchases.Purchase } ) => {
			return item.siteId;
		},
		render: ( { item }: { item: Purchases.Purchase } ) => {
			return <PurchaseItemRow purchase={ item } />;
		},
	},
] as Fields< Purchases.Purchase >;
