import { store, key, payment, receipt } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_BILLING_LINK,
	A4A_INVOICES_LINK,
	A4A_LICENSES_LINK,
	A4A_PAYMENT_METHODS_LINK,
	A4A_PURCHASES_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const usePurchasesMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: key,
					path: A4A_PURCHASES_LINK,
					link: A4A_LICENSES_LINK,
					title: translate( 'Licenses' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Purchases / Licenses',
					},
				},
				path
			),
			createItem(
				{
					icon: store,
					path: A4A_PURCHASES_LINK,
					link: A4A_BILLING_LINK,
					title: translate( 'Billing' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Purchases / Billing',
					},
				},
				path
			),
			createItem(
				{
					icon: payment,
					path: A4A_PURCHASES_LINK,
					link: A4A_PAYMENT_METHODS_LINK,
					title: translate( 'Payment methods' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Purchases / Payment methods',
					},
				},
				path
			),
			createItem(
				{
					icon: receipt,
					path: A4A_PURCHASES_LINK,
					link: A4A_INVOICES_LINK,
					title: translate( 'Invoices' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Purchases / Invoices',
					},
				},
				path
			),
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate ] );
	return menuItems;
};

export default usePurchasesMenuItems;
