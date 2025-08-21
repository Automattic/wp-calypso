import { DomainSuggestion, DomainSuggestionPrice, DomainSuggestionsList } from '../../ui';
import { DomainSuggestionCTA } from '../suggestion-cta';
import { type DomainSuggestion as DomainSuggestionType } from './types';

export const SearchResults = () => {
	const suggestions: DomainSuggestionType[] = [
		{
			domain_name: 'example.com',
			cost: '$10',
			product_slug: 'example',
			supports_privacy: true,
		},
		{
			domain_name: 'example.org',
			cost: '$10',
			product_slug: 'example',
			supports_privacy: true,
		},
	];

	return (
		<DomainSuggestionsList>
			{ suggestions?.map( ( suggestion ) => {
				const [ domain, ...tlds ] = suggestion.domain_name.split( '.' );
				return (
					<DomainSuggestion
						key={ suggestion.domain_name }
						domain={ domain }
						tld={ tlds.join( '.' ) }
						price={ <DomainSuggestionPrice price={ suggestion.cost } /> }
						cta={ <DomainSuggestionCTA suggestion={ suggestion } /> }
					/>
				);
			} ) }
		</DomainSuggestionsList>
	);
};
