import { isEnabled } from '@automattic/calypso-config';
import { store, key, payment, receipt } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_BILLING_LINK,
	A4A_INVOICES_LINK,
	A4A_LICENSES_LINK,
	A4A_PAYMENT_METHODS_LINK,
	A4A_PURCHASES_LINK,
	EXTERNAL_WPCOM_PAYMENT_METHODS_URL,
	EXTERNAL_WPCOM_BILLING_HISTORY_URL,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const usePurchasesMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const isBillingDragonCheckoutEnabled = isEnabled( 'a4a-bd-checkout' );
	const menuItems = useMemo( () => {
		const items = [
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
		];

		if ( ! isBillingDragonCheckoutEnabled ) {
			items.push(
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
				)
			);
		}

		items.push(
			createItem(
				{
					icon: payment,
					path: A4A_PURCHASES_LINK,
					link: isBillingDragonCheckoutEnabled
						? EXTERNAL_WPCOM_PAYMENT_METHODS_URL
						: A4A_PAYMENT_METHODS_LINK,
					title: translate( 'Payment methods' ),
					isExternalLink: isBillingDragonCheckoutEnabled,
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Purchases / Payment methods',
					},
				},
				path
			)
		);

		items.push(
			createItem(
				{
					icon: receipt,
					path: A4A_PURCHASES_LINK,
					link: isBillingDragonCheckoutEnabled
						? EXTERNAL_WPCOM_BILLING_HISTORY_URL
						: A4A_INVOICES_LINK,
					title: isBillingDragonCheckoutEnabled
						? translate( 'Billing History' )
						: translate( 'Invoices' ),
					isExternalLink: isBillingDragonCheckoutEnabled,
					trackEventProps: {
						menu_item: isBillingDragonCheckoutEnabled
							? 'Automattic for Agencies / Purchases / Billing History'
							: 'Automattic for Agencies / Purchases / Invoices',
					},
				},
				path
			)
		);

		return items;
	}, [ isBillingDragonCheckoutEnabled, path, translate ] );
	return menuItems;
};

export default usePurchasesMenuItems;
