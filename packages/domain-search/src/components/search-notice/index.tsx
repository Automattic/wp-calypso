import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { isDomainMoveInternal } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { getAvailabilityNotice } from '../../helpers/get-availability-notice';
import { getRootDomain } from '../../helpers/get-root-domain';
import { isFqdnShownAsSuggestion } from '../../helpers/is-fqdn-shown-as-suggestion';
import { isSubdomainWithUnavailableRootDomain } from '../../helpers/is-subdomain-with-unavailable-root-domain';
import { isSupportedPremiumDomain } from '../../helpers/is-supported-premium-domain';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice } from '../../ui';
import { ConnectedDomainMoveNotice } from './connected-domain-move-notice';

const AVAILABLE_DOMAIN_STATUSES = [
	DomainAvailabilityStatus.AVAILABLE,
	DomainAvailabilityStatus.UNKNOWN,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
	// For domains that are transferrable (i.e. registered elsewhere and can be transferred to us), we want to show
	// only the "Already yours? Bring it over" notice instead of the availability notice
	DomainAvailabilityStatus.TRANSFERRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
];

/**
 * Determines whether the availability notice should be hidden for a given domain availability.
 */
const shouldHideAvailabilityNotice = (
	availability: DomainAvailability,
	includeOwnedDomainInSuggestions: boolean
): boolean => {
	if ( AVAILABLE_DOMAIN_STATUSES.includes( availability.status ) ) {
		return true;
	}

	if (
		includeOwnedDomainInSuggestions &&
		availability.status === DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER
	) {
		return true;
	}

	if ( isSupportedPremiumDomain( availability ) ) {
		return true;
	}

	// We don't want to show the availability notice for *.wpcomstaging.com subdomains and other managed subdomains,
	// such as *.tech.blog, *.water.blog, etc.
	if (
		[
			DomainAvailabilityStatus.WPCOM_STAGING_DOMAIN,
			DomainAvailabilityStatus.DOTBLOG_SUBDOMAIN,
		].includes( availability.status )
	) {
		return true;
	}

	// *.wordpress.com and *.wp.com subdomains have `mappable = restricted`
	if ( availability.mappable === DomainAvailabilityStatus.RESTRICTED ) {
		return true;
	}

	return false;
};

/**
 * Whether a domain connected to another of the user's sites can be moved to the site being
 * created. Only offered without a current site, where the move goes to the new site, and in
 * flows that offer moves at all (domain-only flows don't).
 */
const isConnectedDomainMoveToNewSite = (
	availability: DomainAvailability,
	includeOwnedDomainInSuggestions: boolean,
	hasCurrentSite: boolean
): availability is DomainAvailability & { other_site_domain: string } =>
	includeOwnedDomainInSuggestions &&
	! hasCurrentSite &&
	availability.status === DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER &&
	!! availability.product_slug &&
	isDomainMoveInternal( { product_slug: availability.product_slug } ) &&
	!! availability.other_site_domain;

const shouldReturnGenericMappedMessage = ( availability: DomainAvailability ): boolean => {
	const isDomainMapped = DomainAvailabilityStatus.MAPPED === availability.mappable;

	return (
		isDomainMapped &&
		availability.status !== DomainAvailabilityStatus.REGISTERED_SAME_SITE &&
		availability.status !== DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER &&
		availability.status !== DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE &&
		availability.status !== DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE
	);
};

export const SearchNotice = () => {
	const {
		query,
		queries,
		events,
		currentSiteUrl,
		currentSiteId,
		config: { includeOwnedDomainInSuggestions },
	} = useDomainSearch();
	const { error: suggestionError } = useQuery( queries.domainSuggestions( query ) );
	const { data: availability, error: availabilityError } = useQuery(
		queries.domainAvailability( query )
	);

	const movableConnectedDomain =
		availability &&
		isConnectedDomainMoveToNewSite(
			availability,
			includeOwnedDomainInSuggestions,
			!! currentSiteUrl || !! currentSiteId
		)
			? availability
			: undefined;

	const notice = useMemo( () => {
		if (
			! availability ||
			shouldHideAvailabilityNotice( availability, includeOwnedDomainInSuggestions )
		) {
			return null;
		}

		if ( isSubdomainWithUnavailableRootDomain( availability, query ) ) {
			const rootDomain = getRootDomain( query );

			return {
				severity: 'error' as const,
				message: createInterpolateElement(
					sprintf(
						/* translators: %(rootDomain)s is the root domain (e.g. example.com), %(subdomain)s is the searched subdomain (e.g. cms.example.com) */
						__(
							'The root domain <strong>%(rootDomain)s</strong> is owned by another account, so only its owner can add <strong>%(subdomain)s</strong>.'
						),
						{ rootDomain, subdomain: query }
					),
					{ strong: <strong /> }
				),
			};
		}

		if ( shouldReturnGenericMappedMessage( availability ) ) {
			return {
				severity: 'error' as const,
				message: __( 'This domain is already connected to a WordPress.com site.' ),
			};
		}

		return getAvailabilityNotice( query, availability, events, currentSiteUrl );
	}, [ query, availability, events, currentSiteUrl, includeOwnedDomainInSuggestions ] );

	// A failed suggestions request still renders the exact-match card when the FQDN is
	// available, or the move offer for a connected domain, so its error would contradict them.
	const isFqdnShown =
		!! availability && isFqdnShownAsSuggestion( availability, includeOwnedDomainInSuggestions );
	const errorMessage =
		( isFqdnShown || movableConnectedDomain ? undefined : suggestionError?.message ) ??
		availabilityError?.message;

	if ( errorMessage ) {
		return <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice>;
	}

	if ( movableConnectedDomain ) {
		return <ConnectedDomainMoveNotice availability={ movableConnectedDomain } />;
	}

	if ( ! notice ) {
		return null;
	}

	return <DomainSearchNotice status={ notice.severity }>{ notice.message }</DomainSearchNotice>;
};
