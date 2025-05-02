import { category, payment, receipt } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getUserBillingType } from 'calypso/state/a8c-for-agencies/agency/selectors';
import {
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
	A4A_CLIENT_PAYMENT_METHODS_LINK,
	A4A_CLIENT_INVOICES_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useClientMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const userBillingType = useSelector( getUserBillingType );

	// If the user billing type is 'billingdragon', this mean we are reusing WPCOM billing and
	// we need to redirect to the WPCOM billing page for this particular users.
	const isBillingTypeBD = userBillingType === 'billingdragon';

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
				link: isBillingTypeBD
					? 'https://wordpress.com/me/purchases/payment-methods'
					: A4A_CLIENT_PAYMENT_METHODS_LINK,
				title: translate( 'Payment methods' ),
				isExternalLink: isBillingTypeBD,
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Client > Payment methods',
				},
			},
			{
				icon: receipt,
				path: '/',
				link: isBillingTypeBD
					? 'https://wordpress.com/me/purchases/billing'
					: A4A_CLIENT_INVOICES_LINK,
				title: translate( 'Invoices' ),
				isExternalLink: isBillingTypeBD,
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Client > Invoices',
				},
			},
		].map( ( item ) => createItem( item, path ) );
	}, [ isBillingTypeBD, path, translate ] );
	return menuItems;
};

export default useClientMenuItems;
