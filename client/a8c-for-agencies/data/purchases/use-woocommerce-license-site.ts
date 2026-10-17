import { wooCommerceLicenseSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { License } from 'calypso/state/partner-portal/types';

/**
 * The site a license is on.
 *
 * WooCommerce.com can move a Woo extension's subscription to another store, which leaves the
 * license's own site URL pointing at the store it was first assigned to, so for Woo licenses
 * WooCommerce.com is the source of truth. While that lookup is in flight the site is unknown
 * rather than the possibly stale one; the license's own URL is only kept when WooCommerce.com
 * can't tell us. Every row shares one request.
 */
export default function useWooCommerceLicenseSite( license: License ) {
	const agencyId = useSelector( getActiveAgencyId ) ?? 0;
	const isWooCommerceSiteLicense =
		license.licenseKey.startsWith( 'woocommerce-' ) && !! license.attachedAt && ! license.revokedAt;

	const { data, isLoading } = useQuery( {
		...wooCommerceLicenseSitesQuery( agencyId ),
		enabled: agencyId > 0 && isWooCommerceSiteLicense,
	} );

	if ( ! isWooCommerceSiteLicense ) {
		return { siteUrl: license.siteUrl, isLoading: false };
	}
	if ( isLoading ) {
		return { siteUrl: null, isLoading: true };
	}
	return {
		siteUrl: data?.[ license.licenseId ]?.site_url ?? license.siteUrl,
		isLoading: false,
	};
}
