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
	Domain as FullDomain,
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
		! domain.aftermarket_auction &&
		! shouldUpgradeToMakeDomainPrimary( {
			domain,
			site,
			user,
		} )
	);
}

export function hasGSuiteWithUs( domain: SiteDomain | FullDomain ) {
	const status = domain.google_apps_subscription?.status;
	return !! status && ! [ 'no_subscription', 'other_provider' ].includes( status );
}

export function hasTitanMailWithUs( domain: SiteDomain | FullDomain ) {
	const subscriptionStatus = domain.titan_mail_subscription?.status;
	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}

export function hasEmailForwards( domain: SiteDomain | FullDomain ) {
	return domain?.email_forwards_count ?? 0;
}

export const domainHasEmail = ( domain: SiteDomain ) =>
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
