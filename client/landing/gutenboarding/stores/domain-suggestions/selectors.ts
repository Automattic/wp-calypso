/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '.';
import { DomainSuggestionQuery } from './types';
import { State } from './reducer';
import { stringifyDomainQueryObject } from './utils';

export const getState = ( state: State ) => state;

type DomainSuggestionSelectorOptions = Partial< Exclude< DomainSuggestionQuery, 'query' > >;
export const getDomainSuggestions = (
	state: State,
	search: string,
	options: DomainSuggestionSelectorOptions = {}
) => {
	const normalizedQuery = normalizeDomainSuggestionQuery( search, options );

	// We need to go through the `select` store to get the resolver action
	return select( STORE_KEY ).__internalGetDomainSuggestions( normalizedQuery );
};

/**
 * Do not use this selector. It is for internal use.
 *
 * @private
 */
export const __internalGetDomainSuggestions = (
	state: State,
	queryObject: DomainSuggestionQuery
) => {
	return state.domainSuggestions[ stringifyDomainQueryObject( queryObject ) ];
};

/**
 * Normalize domain query
 *
 * It's important to have a consistent, reproduceable representation of a domains query so that the result can be
 * stored and retrieved.
 *
 * @see client/state/domains/suggestions/utils.js
 * @see client/components/data/query-domains-suggestions/index.jsx
 */
function normalizeDomainSuggestionQuery(
	search: string,
	q: DomainSuggestionSelectorOptions
): DomainSuggestionQuery {
	return Object.assign(
		{
			query: search.toLocaleLowerCase(),
			include_wordpressdotcom: q.include_wordpressdotcom || false, // @FIXME replace `||` with `??`
			quantity: q.quantity || 5, // @FIXME replace `||` with `??`
			vendor: 'variation2_front', // see client/lib/domains/suggestions/index.js
		},
		q.recommendation_context && { recommendation_context: q.recommendation_context },
		q.vertical && { vertical: q.vertical }
	);
}
