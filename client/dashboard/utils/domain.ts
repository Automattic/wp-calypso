import {
	DotcomFeatures,
	WhoisType,
	DomainSubtype,
	DomainStatus,
	DomainTypes,
} from '@automattic/api-core';
import { addQueryArgs } from '@wordpress/url';
import { isAfter, subMinutes, subDays } from 'date-fns';
import { getRenewalUrlFromPurchase } from './purchase';
import { hasPlanFeature } from './site-features';
import { userHasFlag } from './user';
import type {
	Purchase,
	Domain,
	DomainSummary,
	Site,
	User,
	WhoisDataEntry,
	TitanEmailSubscription,
	GoogleEmailSubscription,
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

export function isDomainRenewable( domain: DomainSummary ): boolean {
	// Only registered domains can be manually renewed
	if ( ! isRegisteredDomain( domain ) ) {
		return false;
	}

	return (
		!! domain.subscription_id &&
		!! domain.current_user_is_owner &&
		! (
			domain.domain_status.id === DomainStatus.PENDING_RENEWAL ||
			domain.domain_status.id === DomainStatus.PENDING_TRANSFER ||
			domain.domain_status.id === DomainStatus.PENDING_REGISTRATION ||
			domain.domain_status.id === DomainStatus.EXPIRED_IN_AUCTION
		)
	);
}

export function isDomainUpdatable( domain: DomainSummary ) {
	return domain.domain_status.id !== DomainStatus.PENDING_TRANSFER && ! domain.expired;
}

export function isDomainInGracePeriod( domain: DomainSummary ) {
	if ( domain.expiry === null ) {
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

export function shouldUpgradeToMakeDomainPrimary( {
	domain,
	site,
	user,
}: {
	domain: DomainSummary;
	site: Site;
	user: User;
} ) {
	return (
		( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ||
			domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION ) &&
		! domain.primary_domain &&
		userHasFlag( user, 'calypso_allow_nonprimary_domains_without_plan' ) &&
		!! site.plan?.is_free &&
		! hasPlanFeature( site, DotcomFeatures.SET_PRIMARY_CUSTOM_DOMAIN ) &&
		! site.is_garden
	);
}

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
		! shouldUpgradeToMakeDomainPrimary( {
			domain,
			site,
			user,
		} )
	);
}

export function hasGSuiteWithUs( domain: Domain ) {
	const status = domain.google_apps_subscription?.status;
	return !! status && ! [ 'no_subscription', 'other_provider' ].includes( status );
}

export function hasTitanMailWithUs( domain: Domain ) {
	const subscriptionStatus = domain.titan_mail_subscription?.status;
	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}

/**
 * Returns the maximum number of mailboxes that can be provisioned for a domain. Because a Titan
 * subscription must have at least one mailbox, `1` is the default return value even for domains
 * without an active Titan subscription.
 */
export function getMaxTitanMailboxCount( domain: Domain ): number {
	return ( domain.titan_mail_subscription as TitanEmailSubscription )?.maximum_mailbox_count ?? 1;
}

export function getGSuiteMailboxCount( domain: Domain ): number {
	return ( domain?.google_apps_subscription as GoogleEmailSubscription )?.total_user_count ?? 0;
}

export function hasEmailForwards( domain: Domain ) {
	return !! ( domain?.email_forwards_count ?? 0 );
}

export const domainHasEmail = ( domain: Domain ) =>
	hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) || hasEmailForwards( domain );

export function findRegistrantWhois( whoisContacts: WhoisDataEntry[] | undefined ) {
	return whoisContacts?.find( ( contact ) => contact.type === WhoisType.REGISTRANT );
}

export function findPrivacyServiceWhois( whoisContacts: WhoisDataEntry[] | undefined ) {
	return whoisContacts?.find( ( contact ) => contact.type === WhoisType.PRIVACY_SERVICE );
}

export function getTopLevelOfTld( domainName: string ): string {
	return domainName.substring( domainName.lastIndexOf( '.' ) + 1 );
}

/**
 * List of multi-level TLDs that WordPress.com supports
 */
const WPCOM_MULTI_LEVEL_TLDS = [
	'ac.id',
	'ac.jp',
	'ac.uk',
	'adv.br',
	'app.br',
	'asn.au',
	'av.tr',
	'bc.ca',
	'biz.in',
	'blog.br',
	'business.in',
	'co.at',
	'co.id',
	'co.il',
	'co.in',
	'co.jp',
	'co.ke',
	'co.kr',
	'co.nz',
	'co.th',
	'co.tz',
	'co.uk',
	'co.za',
	'com.ar',
	'com.au',
	'com.br',
	'com.cn',
	'com.cy',
	'com.ec',
	'com.gt',
	'com.hk',
	'com.in',
	'com.kw',
	'com.mt',
	'com.mx',
	'com.my',
	'com.ng',
	'com.pe',
	'com.ph',
	'com.pl',
	'com.py',
	'com.sa',
	'com.sg',
	'com.tr',
	'com.tw',
	'com.ua',
	'com.uy',
	'com.vn',
	'coop.br',
	'dev.br',
	'eco.br',
	'edu.au',
	'edu.br',
	'edu.co',
	'edu.hk',
	'edu.in',
	'edu.iq',
	'edu.mx',
	'edu.ph',
	'edu.pl',
	'edu.tw',
	'edu.vn',
	'fm.br',
	'gob.mx',
	'gov.au',
	'gov.br',
	'gov.in',
	'gov.uk',
	'info.in',
	'ltd.uk',
	'me.uk',
	'mil.br',
	'mil.in',
	'ne.jp',
	'net.au',
	'net.br',
	'net.in',
	'net.mx',
	'net.nz',
	'net.uk',
	'nhs.uk',
	'nic.in',
	'or.id',
	'or.jp',
	'org.ar',
	'org.au',
	'org.br',
	'org.hk',
	'org.il',
	'org.in',
	'org.mx',
	'org.nz',
	'org.tw',
	'org.uk',
	'org.za',
	'plc.uk',
	'police.uk',
	'qc.ca',
	'radio.br',
	'us.com',
];

/**
 * Parse a domain fragment against a list of TLDs recursively
 */
function parseDomainAgainstTldList( domainFragment: string, tldList: string[] ): string {
	if ( ! domainFragment ) {
		return '';
	}

	if ( tldList.includes( domainFragment ) ) {
		return domainFragment;
	}

	const parts = domainFragment.split( '.' );
	const suffix = parts.slice( 1 ).join( '.' );

	return parseDomainAgainstTldList( suffix, tldList );
}

/**
 * Parse the TLD from a given domain name, semi-naively. The function
 * first parses against a list of TLDs that have been sold on WP.com
 * and falls back to a simplistic "everything after the last dot" approach
 * if the list of explicitly allowed TLDs failed.
 */
function getTld( domainName: string ): string {
	const lastIndexOfDot = domainName.lastIndexOf( '.' );

	if ( lastIndexOfDot === -1 ) {
		return '';
	}

	let tld = parseDomainAgainstTldList( domainName, WPCOM_MULTI_LEVEL_TLDS );

	if ( ! tld ) {
		tld = domainName.substring( lastIndexOfDot + 1 );
	}

	return tld;
}

/**
 * Get the root domain from a given domain name
 */
function getRootDomain( domainName: string ): string {
	if ( ! domainName ) {
		return '';
	}

	const domainNameParts = domainName.split( '.' );
	const tldParts = getTld( domainName ).split( '.' );

	const rootDomainParts = domainNameParts.slice( -( tldParts.length + 1 ) );

	return rootDomainParts.join( '.' );
}

/**
 * Check if a domain name is a subdomain
 */
export function isSubdomain( domainName: string ): boolean {
	if ( ! domainName || domainName === '' ) {
		return false;
	}

	const isValidSubdomain = Boolean(
		domainName.match(
			/^([a-z0-9_]([a-z0-9\-_]*[a-z0-9_])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/
		)
	);

	return isValidSubdomain && getRootDomain( domainName ) !== domainName;
}

export function isGoogleWorkspaceSupportedDomain( domain: Domain ) {
	if ( domain.google_apps_subscription?.status === 'other_provider' ) {
		return false;
	}

	// If the domain is registered through us, there is a provisioning period when
	// `hasWpcomNameservers` will be false. We still want to let users buy Google Workspace
	// during that period, even if we normally wouldn't let them under these conditions.
	// Therefore, we check those conditions and return true if the registration happened less
	// than 15 minutes ago. 15 minutes is an arbitrary number.
	if (
		isRegisteredDomain( domain ) &&
		! domain.has_wpcom_nameservers &&
		isRecentlyRegistered( domain.registration_date, 15 )
	) {
		return true;
	}

	const isHostedOnWpcom =
		isRegisteredDomain( domain ) && ( domain.has_wpcom_nameservers || hasGSuiteWithUs( domain ) );
	if (
		! isHostedOnWpcom &&
		! ( domain.type === DomainTypes.MAPPED && domain.has_wpcom_nameservers )
	) {
		return false;
	}

	return ! domain.domain.endsWith( '.wpcomstaging.com' );
}
