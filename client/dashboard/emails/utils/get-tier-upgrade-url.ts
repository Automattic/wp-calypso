import { addQueryArgs } from '@wordpress/url';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { IntervalLength, TitanPlanTier } from '../types';
import { TITAN_TIER_SLUGS } from './titan-tiers';

/**
 * Builds the checkout URL for upgrading an existing Titan subscription to a
 * higher tier. Mirrors the generic product-upgrade flow (getSitePurchaseUpgradeUrl):
 * go straight to /checkout with the target product and redirect back to the
 * dashboard. The product alias encodes the domain and the existing mailbox count
 * so the backend upgrades the current subscription in place rather than creating
 * a new one (alias format parsed by use-prepare-products-for-cart).
 */
export function getTitanTierUpgradeUrl( {
	siteSlug,
	domain,
	tier,
	interval,
	quantity,
}: {
	siteSlug: string;
	domain: string;
	tier: TitanPlanTier;
	interval: IntervalLength;
	quantity: number;
} ): string {
	const productSlug = TITAN_TIER_SLUGS[ tier ][ interval ];
	const productAlias = `${ productSlug }:${ domain }:-q-${ quantity }`;
	const backUrl = redirectToDashboardLink();

	return addQueryArgs( wpcomLink( `/checkout/${ siteSlug }/${ productAlias }` ), {
		redirect_to: backUrl,
		cancel_to: backUrl,
	} );
}
