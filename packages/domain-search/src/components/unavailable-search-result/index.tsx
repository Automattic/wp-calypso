import { DomainAvailabilityStatus } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRootDomain, isSubdomain } from '../../helpers';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion } from '../../ui';
import type { UnavailableProps } from '../../ui/domain-suggestion/unavailable';

const STATUSES_WITH_MESSAGES = [
	DomainAvailabilityStatus.TRANSFERRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
	DomainAvailabilityStatus.MAPPABLE,
	DomainAvailabilityStatus.MAPPED,
	DomainAvailabilityStatus.TLD_NOT_SUPPORTED,
	DomainAvailabilityStatus.TLD_NOT_SUPPORTED_TEMPORARILY,
	DomainAvailabilityStatus.UNKNOWN,
];

export const UnavailableSearchResult = () => {
	const {
		query,
		queries,
		events,
		config: { allowsUsingOwnDomain },
	} = useDomainSearch();
	const { data: availability } = useQuery( queries.domainAvailability( query ) );

	const { onExternalDomainClick } = events;

	const props: UnavailableProps | null = useMemo( () => {
		if ( ! availability || ! STATUSES_WITH_MESSAGES.includes( availability.status ) ) {
			return null;
		}

		const domainArgument = isSubdomain( availability.domain_name )
			? getRootDomain( availability.domain_name )
			: availability.domain_name;

		const onTransferClick = allowsUsingOwnDomain
			? () => onExternalDomainClick( domainArgument )
			: undefined;

		if (
			[ DomainAvailabilityStatus.TLD_NOT_SUPPORTED, DomainAvailabilityStatus.UNKNOWN ].includes(
				availability.status
			)
		) {
			return {
				tld: availability.tld,
				reason: 'tld-not-supported',
				onTransferClick,
			};
		} else if ( DomainAvailabilityStatus.TLD_NOT_SUPPORTED_TEMPORARILY === availability.status ) {
			return {
				tld: availability.tld,
				reason: 'tld-not-supported-temporarily',
				onTransferClick,
			};
		}

		return {
			domain: domainArgument.replace( `.${ availability.tld }`, '' ),
			tld: availability.tld,
			reason: 'already-registered',
			onTransferClick,
		};
	}, [ availability, onExternalDomainClick, allowsUsingOwnDomain ] );

	if ( ! props ) {
		return null;
	}

	return <DomainSuggestion.Unavailable { ...props } />;
};
