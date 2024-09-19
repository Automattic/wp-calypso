import configApi from '@automattic/calypso-config';
import { DomainSuggestions } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import type { DataResponse } from '@automattic/plans-grid-next';

export function useGetFreeSubdomainSuggestion( query: string | null ): {
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestions.DomainSuggestion >;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading: isLoading,
		isError,
		invalidateCache: invalidateDomainSuggestionCache,
	} = DomainSuggestions.useGetWordPressSubdomain( query );

	const result = ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined;

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
