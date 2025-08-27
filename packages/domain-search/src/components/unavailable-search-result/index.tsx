import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion } from '../../ui';
import { UnavailabilityReason } from '../../ui/domain-suggestion/unavailable';

export const UnavailableSearchResult = () => {
	const { query, queries, events } = useDomainSearch();
	const { data: availability } = useQuery( queries.domainAvailability( query ) );

	const props = useMemo( () => {
		if ( ! availability ) {
			return null;
		}

		const domain = '';
		const tld = '';
		let reason: UnavailabilityReason | undefined;
		const canTransfer = true;

		if ( domain && tld && reason ) {
			return {
				domain,
				tld,
				reason,
				onTransferClick:
					canTransfer && events.onExternalDomainClick
						? () => events.onExternalDomainClick?.( availability.domain_name )
						: undefined,
			};
		}
	}, [ availability, events ] );

	if ( ! props ) {
		return null;
	}

	return <DomainSuggestion.Unavailable { ...props } />;
};
