import { DomainAvailabilityStatus } from '@automattic/api-core';
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

export const SearchNotice = () => {
	const { query, queries, events, currentSiteUrl } = useDomainSearch();
	const { error: suggestionError } = useQuery( queries.domainSuggestions( query ) );
	const { data: availability, error: availabilityError } = useQuery(
		queries.domainAvailability( query )
	);

	const notice = useMemo( () => {
		if ( ! availability || AVAILABLE_DOMAIN_STATUSES.includes( availability.status ) ) {
			return null;
		}

		if (
			availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM &&
			availability.is_supported_premium_domain
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
	}, [ query, availability, events, currentSiteUrl ] );

	const errorMessage = suggestionError?.message ?? availabilityError?.message;

	if ( errorMessage ) {
		return <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice>;
	}

	if ( ! notice ) {
		return null;
	}

	return <DomainSearchNotice status={ notice.severity }>{ notice.message }</DomainSearchNotice>;
};
