import { addQueryArgs } from '@wordpress/url';
import { isAfter, subMinutes, subDays } from 'date-fns';
import { DotcomFeatures } from '../data/constants';
import { WhoisType } from '../data/domain-whois';
import { DomainTypes } from '../data/domains';
import { getRenewalUrlFromPurchase } from './purchase';
import { hasPlanFeature } from './site-features';
import { userHasFlag } from './user';
import type { Purchase } from '../data/purchase';
import type { SiteDomain, DomainSummary, Site, User, WhoisDataEntry } from '../data/types';

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
	return ! domain.wpcom_domain && domain.has_registration;
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
		( isRegisteredDomain( domain ) || domain.type === DomainTypes.MAPPED ) &&
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

function isRecord( value: unknown ): value is Record< string, unknown > {
	const valueAsObject = value as Record< string, unknown > | undefined;
	return valueAsObject?.constructor === Object;
}

/**
 * Convert a camelCaseWord to a snake_case_word.
 *
 * This is designed to work nearly identically to the lodash `snakeCase`
 * function. Notably:
 *
 * - Leading and trailing spaces are removed.
 * - Leading and trailing underscores are removed.
 * - Spaces are collapsed into a single underscore.
 * - Numbers are considered to be capital letters of a different type.
 * - Multiple adjacent captial letters of the same type are considered part of the same word.
 */
export function camelToSnakeCase( camelCaseString: string ): string {
	return (
		camelCaseString
			// collapse all spaces into an underscore
			.replace( /\s+/g, '_' )
			// wrap underscores around capitalized words
			.replace( /[A-Z][a-z]+/g, ( letter: string ): string => `_${ letter.toLowerCase() }_` )
			// wrap underscores around capital letter groups
			.replace( /[A-Z]+/g, ( letter: string ): string => `_${ letter.toLowerCase() }_` )
			// wrap underscores around number groups
			.replace( /[0-9]+/g, ( letter: string ): string => `_${ letter }_` )
			// remove duplicate underscores
			.replace( /_+/g, '_' )
			// strip leading/trailing underscores
			.replace( /(^_)|(_$)/g, '' )
	);
}

/**
 * Transform the keys of an record object recursively
 *
 * This transforms an object, modifying all of its keys using a tranform
 * function. If any of the values of the object are also record objects, their
 * keys will also be transformed, and so on.
 *
 * Note that even though Arrays are objects, this will not modify arrays that
 * it finds, so any objects contained within arrays that are properties of the
 * original object will be returned unchanged.
 */
export function mapRecordKeysRecursively(
	record: Record< string, unknown >,
	transform: ( original: string ) => string
): Record< string, unknown > {
	return Object.keys( record ).reduce( function ( mapped, key ) {
		let value = record[ key ];
		if ( isRecord( value ) ) {
			value = mapRecordKeysRecursively( value, transform );
		}
		return {
			...mapped,
			[ transform( key ) ]: value,
		};
	}, {} );
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
