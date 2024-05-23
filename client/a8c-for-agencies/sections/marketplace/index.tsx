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
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
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
	page( A4A_MARKETPLACE_LINK, requireAccessContext, marketplaceContext, makeLayout, clientRender );
	page(
		A4A_MARKETPLACE_PRODUCTS_LINK,
		requireAccessContext,
		marketplaceProductsContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MARKETPLACE_HOSTING_LINK,
		requireAccessContext,
		marketplaceHostingContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
		requireAccessContext,
		marketplacePressableContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
		requireAccessContext,
		marketplaceWpcomContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MARKETPLACE_CHECKOUT_LINK,
		requireAccessContext,
		checkoutContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
		requireAccessContext,
		assignLicenseContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK,
		requireAccessContext,
		downloadProductsContext,
		makeLayout,
		clientRender
	);
}
