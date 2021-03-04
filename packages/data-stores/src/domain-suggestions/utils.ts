/**
 * External dependencies
 */
import deterministicStringify from 'fast-json-stable-stringify';
import formatCurrency from '@automattic/format-currency';
// This is commented out due to cyclic package dependency compilation error.
// Since domain picker passes in the vendor prop it is safe to hardcode this for now.
// We can re-enable this in a separate PR.
// import { getDomainSuggestionsVendor } from '@automattic/domain-picker';

/**
 * Internal dependencies
 */
import type { DomainSuggestionQuery, DomainSuggestionSelectorOptions } from './types';

/**
 * Stable transform to an object key for storage and access.
 *
 * @see client/state/domains/suggestions/utils.js
 */
export const stringifyDomainQueryObject: (
	q: DomainSuggestionQuery
) => string = deterministicStringify;

/**
 * Formats the domain suggestion price according to 'format-currency' package rules
 * We use this for consistency in prices formats across plans and domains
 *
 * @param price the domain suggestion raw price
 * @param currencyCode the currency code to be used when formatting price
 */
export function getFormattedPrice( price: number, currencyCode: string ): string {
	return formatCurrency( price, currencyCode, {
		stripZeros: true,
	} ) as string;
}

/**
 * Normalize domain query
 *
 * It's important to have a consistent, reproduceable representation of a domains query so that the result can be
 * stored and retrieved.
 *
 * @see client/state/domains/suggestions/utils.js
 * @see client/components/data/query-domains-suggestions/index.jsx
 *
 * @param search       Domain search string
 * @param queryOptions Optional paramaters for the query
 * @returns Normalized query object
 */
export function normalizeDomainSuggestionQuery(
	search: string,
	queryOptions: DomainSuggestionSelectorOptions
): DomainSuggestionQuery {
	return {
		// Defaults
		include_wordpressdotcom: queryOptions.only_wordpressdotcom || false,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		quantity: 5,
		// This is commented out due to cyclic package dependency compilation error.
		// Since domain picker passes in the vendor prop it is safe to hardcode this for now.
		// We can re-enable this in a separate PR.
		// vendor: getDomainSuggestionsVendor(),
		vendor: 'variation2_front',

		// Merge options
		...queryOptions,

		// Add the search query
		query: search.trim().toLocaleLowerCase(),
	};
}
