import { useIsMutating, useQuery } from '@tanstack/react-query';
import {
	isFreeSubdomainQuery,
	isWpcomSubdomainQuery,
	stripWpcomSubdomainSuffix,
} from '../../helpers';
import { useDomainSearch } from '../../page/context';
import { DomainSearchSkipSuggestion } from '../../ui';

const SkipSuggestion = () => {
	const { queries, query, currentSiteUrl, events, setQuery } = useDomainSearch();

	const isMutating = useIsMutating();

	const isFreeSubdomain = isFreeSubdomainQuery( query );
	const normalizedQuery = isWpcomSubdomainQuery( query )
		? stripWpcomSubdomainSuffix( query )
		: query;

	const { data: suggestion } = useQuery( queries.freeSuggestion( normalizedQuery ) );

	if ( currentSiteUrl ) {
		return (
			<DomainSearchSkipSuggestion
				existingSiteUrl={ currentSiteUrl }
				onSkip={ () => events.onSkip() }
				disabled={ !! isMutating }
			/>
		);
	}

	if ( suggestion ) {
		const isUnavailable = isFreeSubdomain && suggestion.domain_name !== query;

		return (
			<DomainSearchSkipSuggestion
				freeSuggestion={ suggestion.domain_name }
				unavailableDomain={ isUnavailable ? query : undefined }
				onSkip={ () => events.onSkip( suggestion ) }
				onSuggestionClick={ () => setQuery( suggestion.domain_name ) }
				disabled={ !! isMutating }
			/>
		);
	}

	return null;
};

SkipSuggestion.Placeholder = DomainSearchSkipSuggestion.Placeholder;

export { SkipSuggestion };
