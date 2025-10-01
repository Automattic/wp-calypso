import { useEvent } from '@wordpress/compose';
import { useEffect } from 'react';
import { usePolicyBadges } from '../../hooks/use-policy-badges';
import { useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSuggestionBadges } from '../../hooks/use-suggestion-badges';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion } from '../../ui';
import { DomainSuggestionCTA } from '../suggestion-cta';
import { DomainSuggestionPrice } from '../suggestion-price';

interface SearchResultsItemProps {
	domainName: string;
}

export const SearchResultsItem = ( { domainName }: SearchResultsItemProps ) => {
	const [ domain, ...tlds ] = domainName.split( '.' );
	const tld = tlds.join( '.' );

	const suggestionBadges = useDomainSuggestionBadges( domainName );
	const policyBadges = usePolicyBadges( domainName );
	const badges = [ ...suggestionBadges, ...policyBadges ];
	const { events } = useDomainSearch();
	const suggestion = useSuggestion( domainName );

	const triggerSuggestionRenderEvent = useEvent( () => {
		events.onSuggestionRender( suggestion );
	} );

	useEffect( () => {
		triggerSuggestionRenderEvent();
	}, [ triggerSuggestionRenderEvent ] );

	return (
		<DomainSuggestion
			badges={ badges.length > 0 ? badges : undefined }
			domain={ domain }
			tld={ tld }
			price={ <DomainSuggestionPrice domainName={ domainName } /> }
			cta={ <DomainSuggestionCTA domainName={ domainName } /> }
		/>
	);
};
