import { useIsMutating, useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import { DomainSearchSkipSuggestion } from '../../ui';

const SkipSuggestion = () => {
	const { queries, query, currentSiteUrl, events } = useDomainSearch();

	const isMutating = useIsMutating();

	const { data: suggestion } = useQuery( queries.freeSuggestion( query ) );

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
		return (
			<DomainSearchSkipSuggestion
				freeSuggestion={ suggestion.domain_name }
				onSkip={ () => events.onSkip( suggestion ) }
				disabled={ !! isMutating }
			/>
		);
	}

	return null;
};

SkipSuggestion.Placeholder = DomainSearchSkipSuggestion.Placeholder;

export { SkipSuggestion };
