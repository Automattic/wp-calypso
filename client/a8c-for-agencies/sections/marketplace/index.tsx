import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_MARKETPLACE_DOWNLOAD_PRODUCTS_LINK,
	A4A_MARKETPLACE_HOSTING_REFER_ENTERPRISE_LINK,
	A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	assignLicenseContext,
	checkoutContext,
	marketplaceContext,
	marketplaceHostingContext,
	marketplaceProductsContext,
	downloadProductsContext,
	marketplaceReferEnterpriseHostingContext,
	marketplaceReferPremiumPlanContext,
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

	if ( isEnabled( 'a4a-vip-partner-opportunity-referrals' ) ) {
		page(
			A4A_MARKETPLACE_HOSTING_REFER_ENTERPRISE_LINK,
			requireAccessContext,
			marketplaceReferEnterpriseHostingContext,
			makeLayout,
			clientRender
		);
	}

	if ( isEnabled( 'pressable-premium-plan' ) ) {
		page(
			A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK,
			requireAccessContext,
			marketplaceReferPremiumPlanContext,
			makeLayout,
			clientRender
		);
	}

	page(
		`${ A4A_MARKETPLACE_HOSTING_LINK }/:section?`,
		requireAccessContext,
		marketplaceHostingContext,
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
