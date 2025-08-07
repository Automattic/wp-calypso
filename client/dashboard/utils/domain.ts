import { isAfter, subMinutes } from 'date-fns';
import { DotcomFeatures } from '../data/constants';
import { DomainTypes } from '../data/domains';
import { hasPlanFeature } from './site-features';
import { userHasFlag } from './user';
import type { Domain, Site, User } from '../data/types';

export function isRecentlyRegistered( registrationDate: string, numberOfMinutes = 30 ) {
	return (
		!! registrationDate &&
		isAfter( new Date( registrationDate ), subMinutes( new Date(), numberOfMinutes ) )
	);
}

export function isDomainRenewable( domain: Domain ) {
	// Only registered domains can be manually renewed
	if ( domain.type !== DomainTypes.REGISTERED ) {
		return false;
	}

	return (
		!! domain.subscription_id &&
		! domain.pending_renewal &&
		! domain.pending_registration_at_registry &&
		! domain.pending_registration &&
		domain.current_user_can_manage &&
		( domain.is_renewable || domain.is_redeemable ) &&
		! domain.aftermarket_auction
	);
}

const shouldUpgradeToMakeDomainPrimary = ( {
	domain,
	site,
	user,
}: {
	domain: Domain;
	site: Site;
	user: User;
} ) => {
	return (
		( domain.type === DomainTypes.REGISTERED || domain.type === DomainTypes.MAPPED ) &&
		! domain.current_user_can_create_site_from_domain_only &&
		! domain.primary_domain &&
		! domain.wpcom_domain &&
		! domain.is_wpcom_staging_domain &&
		userHasFlag( user, 'calypso_allow_nonprimary_domains_without_plan' ) &&
		!! site.plan?.is_free &&
		! hasPlanFeature( site, DotcomFeatures.SET_PRIMARY_CUSTOM_DOMAIN )
	);
};

export function canSetAsPrimary( {
	domain,
	site,
	user,
}: {
	domain: Domain;
	site: Site;
	user: User;
} ): boolean {
	return (
		domain.can_set_as_primary &&
		! domain.primary_domain &&
		! domain.aftermarket_auction &&
		! shouldUpgradeToMakeDomainPrimary( {
			domain,
			site,
			user,
		} )
	);
}
