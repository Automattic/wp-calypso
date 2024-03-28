import page from '@automattic/calypso-router';
import {
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	assignLicenseContext,
	checkoutContext,
	marketplaceContext,
	marketplaceHostingContext,
	marketplacePressableContext,
	marketplaceProductsContext,
	downloadProductsContext,
	marketplaceWpcomContext,
} from './controller';

export default function () {
	// FIXME: check access, TOS consent, valid payment method, all sites context and partner key selection if needed
	page( A4A_MARKETPLACE_LINK, marketplaceContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_PRODUCTS_LINK, marketplaceProductsContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_HOSTING_LINK, marketplaceHostingContext, makeLayout, clientRender );
	page(
		A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
		marketplacePressableContext,
		makeLayout,
		clientRender
	);
	page( A4A_MARKETPLACE_HOSTING_WPCOM_LINK, marketplaceWpcomContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_CHECKOUT_LINK, checkoutContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_ASSIGN_LICENSE_LINK, assignLicenseContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK, downloadProductsContext, makeLayout, clientRender );
}
