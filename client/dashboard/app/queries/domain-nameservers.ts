import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName: string ) =>
	useQuery( {
		queryKey: [ 'domain-nameservers', domainName ],
		queryFn: () => wp.req.get( `/domains/${ domainName }/nameservers/` ) as Promise< string[] >,
		refetchOnWindowFocus: false,
	} );

interface UpdateNameserversOptions {
	onSuccess?: ( data: unknown, variables: { nameservers: string[] }, context: unknown ) => void;
	onError?: ( error: Error ) => void;
}

function useUpdateNameserversMutation(
	domainName: string,
	queryOptions: UpdateNameserversOptions = {}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { nameservers }: { nameservers: string[] } ) =>
			wp.req.post( `/domains/${ domainName }/nameservers`, {
				nameservers: nameservers.map( ( nameserver ) => ( { nameserver } ) ),
			} ),
		...queryOptions,
		onSuccess( ...args ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'domain-nameservers', domainName ],
			} );
			queryOptions.onSuccess?.( ...args );
		},
	} );

	const { mutateAsync } = mutation;

	const updateNameservers = useCallback(
		( nameservers: string[] ) => mutateAsync( { nameservers } ),
		[ mutateAsync ]
	);

	return { updateNameservers, ...mutation };
}

export { useDomainNameserversQuery, useUpdateNameserversMutation };
