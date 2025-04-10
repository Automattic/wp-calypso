import { category, payment, receipt } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
	A4A_CLIENT_PAYMENT_METHODS_LINK,
	A4A_CLIENT_INVOICES_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useClientMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const isNewClient = true;

	const menuItems = useMemo( () => {
		return [
			{
				icon: category,
				path: '/',
				link: A4A_CLIENT_SUBSCRIPTIONS_LINK,
				title: translate( 'Your subscriptions' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Client > Subscriptions',
				},
			},
			{
				icon: payment,
				path: '/',
				link: isNewClient
					? 'https://wordpress.com/me/purchases/payment-methods'
					: A4A_CLIENT_PAYMENT_METHODS_LINK,
				title: translate( 'Payment methods' ),
				isExternalLink: isNewClient,
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Client > Payment methods',
				},
			},
			{
				icon: receipt,
				path: '/',
				link: isNewClient ? 'https://wordpress.com/me/purchases/billing' : A4A_CLIENT_INVOICES_LINK,
				title: translate( 'Invoices' ),
				isExternalLink: isNewClient,
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Client > Invoices',
				},
			},
		].map( ( item ) => createItem( item, path ) );
	}, [ isNewClient, path, translate ] );
	return menuItems;
};

export default useClientMenuItems;
