import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { Purchases } from '@automattic/data-stores';
import { Operator } from '@wordpress/dataviews';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
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
		width: '100%',
		enableGlobalSearch: true,
		enableSorting: true,
		enableHiding: false,
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		getValue: ( { item }: { item: Purchase } ) => {
			return item.siteId;
		},
		render: ( { item }: { item: Purchases.Purchase } ) => {
			return <PurchaseItemRow purchase={ item } />;
		},
	},
	// {
	// 	id: 'purchases',
	// 	label: 'Product',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'status',
	// 	label: 'Status',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'payment-method',
	// 	label: 'Payment method',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'blog_id',
	// 	label: 'Blog ID',
	// 	enableHiding: false,
	// },
	// {
	// 	id: 'product_id',
	// 	label: 'Product ID',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'domain',
	// 	label: 'Domain',
	// 	enableHiding: true,
	// },
] as Object[];
