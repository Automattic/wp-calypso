import configApi from '@automattic/calypso-config';
import { type FreeDomainSuggestion, fetchFreeDomainSuggestion } from '@automattic/data';
import { DataResponse } from '@automattic/plans-grid-next';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from '@wordpress/element';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useGetFreeSubdomainSuggestion( query: string | null ): {
	wpcomFreeDomainSuggestion: DataResponse< FreeDomainSuggestion >;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestion,
		isLoading,
		isError,
		refetch: invalidateDomainSuggestionCache,
	} = useQuery( {
		queryKey: [ 'free-domain-suggestion', query ],
		queryFn: () => fetchFreeDomainSuggestion( query ?? '' ),
		enabled: !! query,
		staleTime: STALE_TIME,
	} );

	const result = ( ! isError && wordPressSubdomainSuggestion ) || undefined;

	useEffect( () => {
		if ( query && ! isLoading && ! result ) {
			logToLogstash( {
				feature: 'calypso_client',
				message: `Sub domain suggestion wasn't available for query: ${ query }`,
				severity: 'warn',
				properties: {
					env: configApi( 'env_id' ),
				},
			} );
		}
	}, [ query, isLoading, result ] );

	return useMemo(
		() => ( {
			wpcomFreeDomainSuggestion: {
				isLoading,
				result,
			},
			invalidateDomainSuggestionCache,
		} ),
		[ isLoading, result, invalidateDomainSuggestionCache ]
	);
}

export default useGetFreeSubdomainSuggestion;
