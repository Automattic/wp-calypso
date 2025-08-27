import { wpcom } from '../wpcom-fetcher';
import type { DomainSuggestion, DomainSuggestionQuery, FreeDomainSuggestion } from './types';

export async function fetchDomainSuggestions(
	search: string,
	domainSuggestionQuery: Partial< DomainSuggestionQuery > = {}
): Promise< DomainSuggestion[] > {
	const defaultDomainSuggestionQuery = {
		include_wordpressdotcom: false,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		quantity: 5,
		vendor: 'variation2_front',
	};

	const suggestions: DomainSuggestion[] = await wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/domains/suggestions',
		},
		{
			...defaultDomainSuggestionQuery,
			...domainSuggestionQuery,
			query: search.trim().toLocaleLowerCase(),
		}
	);

	return suggestions;
}

export async function fetchFreeDomainSuggestion( search: string ): Promise< FreeDomainSuggestion > {
	const [ suggestion ] = await wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/domains/suggestions',
		},
		{
			quantity: 1,
			include_wordpressdotcom: true,
			include_dotblogsubdomain: false,
			only_wordpressdotcom: false,
			vendor: 'dot',
			query: search.trim().toLocaleLowerCase(),
		}
	);

	if ( ! suggestion ) {
		throw new Error( `No free domain suggestion found for query ${ search }` );
	}

	return suggestion;
}
