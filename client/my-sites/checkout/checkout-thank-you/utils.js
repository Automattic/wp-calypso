import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
} from '@automattic/calypso-products';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';

export function getDomainManagementUrl( { slug }, domain ) {
	return domain ? domainManagementEdit( slug, domain ) : domainManagementList( slug );
}

/*
 * Compute link to send a user after a site-less subscription has been successfully transferred
 * to the user site.
 *
 * @param productSlug string – The slug of a Jetpack product.
 * @param siteSlug string|null – The slug of a site.
 * @param wpAdminUrl string|null – The URL of a site's WP Admin.
 */
export function getActivationCompletedLink( productSlug, siteSlug, wpAdminUrl ) {
	const baseJetpackCloudUrl = 'https://cloud.jetpack.com';

	if ( ! siteSlug ) {
		return `${ baseJetpackCloudUrl }/landing`;
	}

	if ( productSlug && JETPACK_BACKUP_PRODUCTS.includes( productSlug ) ) {
		return `${ baseJetpackCloudUrl }/backup/${ siteSlug }`;
	}

	if ( productSlug && JETPACK_SEARCH_PRODUCTS.includes( productSlug ) ) {
		return `${ baseJetpackCloudUrl }/jetpack-search/${ siteSlug }`;
	}

	if ( productSlug && JETPACK_SCAN_PRODUCTS.includes( productSlug ) ) {
		return `${ baseJetpackCloudUrl }/scan/${ siteSlug }`;
	}

	return wpAdminUrl || `${ baseJetpackCloudUrl }/landing/${ siteSlug }`;
}
