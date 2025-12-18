import { emailForwardersQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useForwardingAddresses = ( {
	domains,
	forwardingAddresses,
}: {
	domains: string[];
	forwardingAddresses: string[];
} ) => {
	const emailForwardersQueries = useQueries( {
		queries: domains.map( ( domain ) => ( {
			...emailForwardersQuery( domain ),
		} ) ),
	} );

	const isLoading = emailForwardersQueries.some( ( q ) => q.isLoading );
	const forwards = emailForwardersQueries.flatMap( ( q ) => q.data?.forwards ?? [] );

	const forwardsByMailbox = forwards.reduce( ( acc, f ) => {
		acc.set( f.email, f.forward_address );
		return acc;
	}, new Map< string, string >() );

	const uniqueEmailForwarders = useMemo(
		() => Array.from( new Set( forwards.map( ( f ) => f.forward_address ) ) ),
		[ forwards ]
	);

	const newForwardingAddresses = forwardingAddresses.filter(
		( addr ) => ! uniqueEmailForwarders.includes( addr )
	);

	return { isLoading, forwardsByMailbox, newForwardingAddresses };
};
