import { DotcomFeatures } from '../data/constants';
import { DomainTypes } from '../data/domains';
import { UserFlags } from '../data/me';
import { hasPlanFeature } from './site-features';
import { userHasFlag } from './user';
import type { Domain, Site, User } from '../data/types';

export function isDomainRenewable( domain: Domain ) {
	// Only registered domains can be manually renewed
	if ( domain.type !== DomainTypes.REGISTERED ) {
		return false;
	}

	const shouldNotAllowManualRenew =
		! domain.subscription_id ||
		domain.pending_renewal ||
		domain.pending_registration_at_registry ||
		domain.pending_registration ||
		! domain.current_user_can_manage ||
		( ! domain.is_renewable && ! domain.is_redeemable ) ||
		domain.aftermarket_auction;
	return ! shouldNotAllowManualRenew;
}

export const shouldUpgradeToMakeDomainPrimary = ( {
	domain,
	site,
	user,
}: {
	domain: Domain;
	site?: Site;
	user: User;
} ) => {
	return (
		( domain.type === DomainTypes.REGISTERED || domain.type === DomainTypes.MAPPED ) &&
		! domain.current_user_can_create_site_from_domain_only &&
		! domain.primary_domain &&
		! domain.wpcom_domain &&
		! domain.is_wpcom_staging_domain &&
		userHasFlag( user, UserFlags.CALYPSO_ALLOW_NONPRIMARY_DOMAINS_WITHOUT_PLAN ) &&
		!! site?.plan?.is_free &&
		! ( site && hasPlanFeature( site, DotcomFeatures.SET_PRIMARY_CUSTOM_DOMAIN ) )
	);
};

export function canSetAsPrimary( domain: Domain, shouldUpgradeToMakePrimary: boolean ): boolean {
	return (
		domain &&
		domain.can_set_as_primary &&
		! domain.primary_domain &&
		! shouldUpgradeToMakePrimary &&
		! domain.aftermarket_auction
	);
}
