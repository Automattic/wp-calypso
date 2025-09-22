import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAvailabilityNotice } from '../../helpers/get-availability-notice';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice } from '../../ui';

const AVAILABLE_DOMAIN_STATUSES = [
	DomainAvailabilityStatus.AVAILABLE,
	DomainAvailabilityStatus.UNKNOWN,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
];

/**
 * Determines whether the availability notice should be hidden for a given domain availability
 *
 * @param availability - Domain availability returned from the availability endpoint
 * @returns True if the availability notice should be hidden, false otherwise.
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

	if (
		availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM &&
		availability.is_supported_premium_domain
	) {
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

export const SearchNotice = () => {
	const {
		query,
		queries,
		events,
		currentSiteUrl,
		config: { includeOwnedDomainInSuggestions },
	} = useDomainSearch();
	const { error: suggestionError } = useQuery( queries.domainSuggestions( query ) );
	const { data: availability, error: availabilityError } = useQuery(
		queries.domainAvailability( query )
	);

	const notice = useMemo( () => {
		if (
			! availability ||
			shouldHideAvailabilityNotice( availability, includeOwnedDomainInSuggestions )
		) {
			return null;
		}

		let finalAvailability = availability;

		const isDomainMapped = DomainAvailabilityStatus.MAPPED === availability.mappable;

		if (
			isDomainMapped &&
			availability.status !== DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER &&
			availability.status !== DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE &&
			availability.status !== DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE
		) {
			finalAvailability = {
				...availability,
				status: DomainAvailabilityStatus.MAPPED,
			};
		}

		return getAvailabilityNotice( query, finalAvailability, events, currentSiteUrl );
	}, [ query, availability, events, currentSiteUrl, includeOwnedDomainInSuggestions ] );

	const errorMessage = suggestionError?.message ?? availabilityError?.message;

	if ( errorMessage ) {
		return <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice>;
	}

	if ( ! notice ) {
		return null;
	}

	return <DomainSearchNotice status={ notice.severity }>{ notice.message }</DomainSearchNotice>;
};
