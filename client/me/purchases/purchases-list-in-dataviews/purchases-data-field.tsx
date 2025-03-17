import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { Purchases } from '@automattic/data-stores';
import { Operator } from '@wordpress/dataviews';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import PurchaseItem from '../purchase-item';

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
		render: ( { item }: { item: Purchase } ) => {
			return <div>{ item.siteId }</div>;
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
