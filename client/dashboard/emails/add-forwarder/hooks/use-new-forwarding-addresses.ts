import { DomainSummary } from '@automattic/api-core';
import { emailForwardersQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useNewForwardingAddresses = ( {
	domains,
	forwardingAddresses,
}: {
	domains: DomainSummary[];
	forwardingAddresses: string[];
} ) => {
	const emailForwardersQueries = useQueries( {
		queries: domains.map( ( d ) => ( {
			...emailForwardersQuery( d.domain ),
		} ) ),
	} );

	const isLoading = emailForwardersQueries.some( ( q ) => q.isLoading );

	const uniqueEmailForwarders = useMemo(
		() =>
			Array.from(
				new Set(
					emailForwardersQueries
						.flatMap( ( q ) => q.data?.forwards ?? [] )
						.map( ( f ) => f.forward_address )
				)
			),
		[ emailForwardersQueries ]
	);

	const newForwardingAddresses = forwardingAddresses.filter(
		( addr ) => ! uniqueEmailForwarders.includes( addr )
	);

	return { isLoading, newForwardingAddresses };
};
