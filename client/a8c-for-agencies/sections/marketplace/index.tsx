import page from '@automattic/calypso-router';
import {
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	assignLicenseContext,
	checkoutContext,
	marketplaceContext,
	marketplaceHostingContext,
	marketplaceProductsContext,
} from './controller';

export default function () {
	page( A4A_MARKETPLACE_LINK, marketplaceContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_PRODUCTS_LINK, marketplaceProductsContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_HOSTING_LINK, marketplaceHostingContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_CHECKOUT_LINK, checkoutContext, makeLayout, clientRender );
	page( A4A_MARKETPLACE_ASSIGN_LICENSE_LINK, assignLicenseContext, makeLayout, clientRender );
}
