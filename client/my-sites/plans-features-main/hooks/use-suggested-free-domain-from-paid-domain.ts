import configApi from '@automattic/calypso-config';
import { DomainSuggestions } from '@automattic/data-stores';
import { logToLogstash } from 'calypso/lib/logstash';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

export function useGetFreeSubdomainSuggestion( query: string ): {
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

	if ( ! isLoading && ! result ) {
		logToLogstash( {
			feature: 'calypso_client',
			message: `Sub domain suggestion wasn't available for query: ${ query }`,
			severity: 'warn',
			properties: {
				env: configApi( 'env_id' ),
			},
		} );
	}

	return {
		wpcomFreeDomainSuggestion: {
			isLoading,
			result,
		},
		invalidateDomainSuggestionCache,
	};
}

export default useGetFreeSubdomainSuggestion;
