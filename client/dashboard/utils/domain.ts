import { DotcomFeatures, WhoisType, DomainSubtype } from '@automattic/api-core';
import { addQueryArgs } from '@wordpress/url';
import { isAfter, subMinutes, subDays } from 'date-fns';
import { getRenewalUrlFromPurchase } from './purchase';
import { hasPlanFeature } from './site-features';
import { userHasFlag } from './user';
import type {
	Purchase,
	SiteDomain,
	DomainSummary,
	Site,
	User,
	WhoisDataEntry,
} from '@automattic/api-core';

export function getDomainSiteSlug( domain: DomainSummary ) {
	return domain.primary_domain ? domain.domain : domain.site_slug;
}

export function getDomainRenewalUrl( domain: DomainSummary, purchase: Purchase ) {
	const siteSlug = getDomainSiteSlug( domain );
	const backUrl = window.location.href.replace( window.location.origin, '' );
	return addQueryArgs( getRenewalUrlFromPurchase( purchase, siteSlug ), {
		cancel_to: backUrl,
		redirect_to: backUrl,
	} );
}

export function isRegisteredDomain( domain: DomainSummary ) {
	return domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION;
}

export function isRecentlyRegistered( registrationDate: string, numberOfMinutes = 30 ) {
	return (
		!! registrationDate &&
		isAfter( new Date( registrationDate ), subMinutes( new Date(), numberOfMinutes ) )
	);
}

export function isDomainRenewable( domain: DomainSummary ) {
	// Only registered domains can be manually renewed
	if ( ! isRegisteredDomain( domain ) ) {
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

export function isDomainUpdatable( domain: DomainSummary ) {
	return ! domain.pending_transfer && ! domain.expired;
}

export function isDomainInGracePeriod( domain: DomainSummary ) {
	if ( ! domain.expiry ) {
		return true;
	}

	return isAfter( new Date( domain.expiry ), subDays( new Date(), 18 ) );
}

export function isValidIpAddress( ipAddress: string ): boolean {
	if ( ! ipAddress || ! ipAddress.match( /^(\d{1,3}\.){3}\d{1,3}$/ ) ) {
		return false;
	}

	return true;
}

export function isValidNameServerSubdomain( nameServerSubdomain: string ): boolean {
	if (
		! nameServerSubdomain ||
		nameServerSubdomain.length > 50 || // The subdomain part of name servers in Key-Systems cannot be longer than 50 characters
		! nameServerSubdomain.match(
			/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/
		)
	) {
		return false;
	}

	return true;
}

const shouldUpgradeToMakeDomainPrimary = ( {
	domain,
	site,
	user,
}: {
	domain: DomainSummary;
	site: Site;
	user: User;
} ) => {
	return (
		[ DomainSubtype.DOMAIN_CONNECTION, DomainSubtype.DOMAIN_REGISTRATION ].includes(
			domain.subtype.id
		) &&
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
	domain: DomainSummary;
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

export function hasGSuiteWithUs( domain: SiteDomain ) {
	const status = domain.google_apps_subscription?.status;
	return status && ! [ 'no_subscription', 'other_provider' ].includes( status );
}

export function hasTitanMailWithUs( domain: SiteDomain ) {
	const subscriptionStatus = domain.titan_mail_subscription?.status;
	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}

export function findRegistrantWhois( whoisContacts: WhoisDataEntry[] | undefined ) {
	return whoisContacts?.find( ( contact ) => contact.type === WhoisType.REGISTRANT );
}

export function findPrivacyServiceWhois( whoisContacts: WhoisDataEntry[] | undefined ) {
	return whoisContacts?.find( ( contact ) => contact.type === WhoisType.PRIVACY_SERVICE );
}

export function getTopLevelOfTld( domainName: string ): string {
	return domainName.substring( domainName.lastIndexOf( '.' ) + 1 );
}
