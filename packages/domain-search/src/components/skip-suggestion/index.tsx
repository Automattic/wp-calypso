import { useIsMutating, useQuery } from '@tanstack/react-query';
import {
	isFreeSubdomainQuery,
	isWpcomSubdomainQuery,
	stripWpcomSubdomainSuffix,
} from '../../helpers';
import { useDomainSearch } from '../../page/context';
import { DomainSearchSkipSuggestion } from '../../ui';

const SkipSuggestion = () => {
	const { queries, query, currentSiteUrl, events, setQuery, config } = useDomainSearch();

	const isMutating = useIsMutating();

	const isFreeSubdomain = isFreeSubdomainQuery( query );
	const normalizedQuery = isWpcomSubdomainQuery( query )
		? stripWpcomSubdomainSuffix( query )
		: query;

	// When the free-subdomain card is hidden there is nothing to fetch; otherwise pass the
	// query options through untouched so this observer keeps trunk's exact fetch semantics
	// alongside useSuggestionsList's gated observer on the same key.
	const freeSuggestionOptions = queries.freeSuggestion( normalizedQuery );
	const { data: suggestion } = useQuery(
		config.hideFreeSubdomainSuggestion
			? { ...freeSuggestionOptions, enabled: false }
			: freeSuggestionOptions
	);

	// Flows that never keep a free subdomain (e.g. the atomic funnel) show only a skip control,
	// no *.wordpress.com domain. Skipping with no suggestion records a "choose later" origin.
	if ( config.hideFreeSubdomainSuggestion ) {
		return (
			<DomainSearchSkipSuggestion
				chooseLaterOnly
				title={ config.skipSuggestionCopy?.title }
				buttonText={ config.skipSuggestionCopy?.buttonText }
				onSkip={ () => events.onSkip() }
				disabled={ !! isMutating }
			/>
		);
	}

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
				title={ config.skipSuggestionCopy?.title }
				buttonText={ config.skipSuggestionCopy?.buttonText }
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
