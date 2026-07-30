import { getQueryArg } from '@wordpress/url';
import {
	A4A_LICENSES_LINK,
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { addQueryArgs } from 'calypso/lib/url';

// A4A spells this `sitesdashboard`; the Jetpack Cloud partner portal uses `dashboard` for the
// same idea on its own routes. Mixing them up silently disables the return-to-sites redirect.
const SITES_DASHBOARD_SOURCE = 'sitesdashboard';

// Built by hand rather than with addQueryArgs because `:receiptId` has to reach the post-checkout
// pending page as a literal for it to interpolate, and URLSearchParams would escape the colon.
export function getAutoAssignLicenseUrl( siteId: number, productSlug: string ) {
	return `${ A4A_LICENSES_LINK }?site_id=${ siteId }&product_slug=${ encodeURIComponent(
		productSlug
	) }&receipt_id=:receiptId`;
}

export function getManualAssignLicenseUrl( licenseKey: string, siteId: number ) {
	return addQueryArgs(
		{ key: licenseKey, site_id: siteId, source: SITES_DASHBOARD_SOURCE },
		A4A_MARKETPLACE_ASSIGN_LICENSE_LINK
	);
}

export function isFromSitesDashboard( url: string ) {
	return getQueryArg( url, 'source' ) === SITES_DASHBOARD_SOURCE;
}
