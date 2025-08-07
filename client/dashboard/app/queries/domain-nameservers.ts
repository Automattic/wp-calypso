import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchDomainNameservers, updateDomainNameservers } from '../../data/domain-nameservers';

const useDomainNameserversQuery = ( domainName: string ) =>
	useQuery( {
		queryKey: [ 'domains', domainName, 'nameservers' ],
		queryFn: () => fetchDomainNameservers( domainName ),
		refetchOnWindowFocus: false,
	} );

interface UpdateNameserversOptions {
	onSuccess?: ( nameservers: string[] ) => void;
	onError?: ( error: Error ) => void;
}

function useUpdateNameserversMutation(
	domainName: string,
	queryOptions: UpdateNameserversOptions = {}
) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { nameservers }: { nameservers: string[] } ) =>
			updateDomainNameservers( domainName, nameservers ),
		...queryOptions,
		onSuccess( nameservers ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'domains', domainName, 'nameservers' ],
			} );
			queryOptions.onSuccess?.( nameservers );
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
