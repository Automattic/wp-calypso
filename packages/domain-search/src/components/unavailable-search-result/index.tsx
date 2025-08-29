import { DomainAvailabilityStatus } from '@automattic/data';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRootDomain, isSubdomain } from '../../helpers';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion } from '../../ui';
import type { UnavailableProps } from '../../ui/domain-suggestion/unavailable';

export const UnavailableSearchResult = () => {
	const { query, queries, events } = useDomainSearch();
	const { data: availability } = useQuery( queries.domainAvailability( query ) );

	const { onExternalDomainClick } = events;

	const props: UnavailableProps | null = useMemo( () => {
		if (
			! availability ||
			! [
				DomainAvailabilityStatus.TRANSFERRABLE,
				DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
				DomainAvailabilityStatus.MAPPABLE,
				DomainAvailabilityStatus.MAPPED,
				DomainAvailabilityStatus.RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE,
				DomainAvailabilityStatus.SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
				DomainAvailabilityStatus.TLD_NOT_SUPPORTED,
				DomainAvailabilityStatus.TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE,
				DomainAvailabilityStatus.TLD_NOT_SUPPORTED_TEMPORARILY,
				DomainAvailabilityStatus.UNKNOWN,
			].includes( availability.status )
		) {
			return null;
		}

		if (
			[ DomainAvailabilityStatus.TLD_NOT_SUPPORTED, DomainAvailabilityStatus.UNKNOWN ].includes(
				availability.status
			)
		) {
			return {
				tld: availability.tld,
				reason: 'tld-not-supported',
			};
		} else if ( DomainAvailabilityStatus.TLD_NOT_SUPPORTED_TEMPORARILY === availability.status ) {
			return {
				tld: availability.tld,
				reason: 'tld-not-supported-temporarily',
			};
		}

		const domainArgument = isSubdomain( availability.domain_name )
			? getRootDomain( availability.domain_name )
			: availability.domain_name;

		return {
			domain: domainArgument.replace( `.${ availability.tld }`, '' ),
			tld: availability.tld,
			reason: 'already-registered',
			onTransferClick: onExternalDomainClick
				? () => onExternalDomainClick( domainArgument )
				: undefined,
		};
	}, [ availability, onExternalDomainClick ] );

	if ( ! props ) {
		return null;
	}

	return <DomainSuggestion.Unavailable { ...props } />;
};
