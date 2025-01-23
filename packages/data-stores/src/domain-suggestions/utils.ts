import formatCurrency from '@automattic/format-currency';
import deterministicStringify from 'fast-json-stable-stringify';
import type { DomainSuggestionQuery, DomainSuggestionSelectorOptions } from './types';

/**
 * Stable transform to an object key for storage and access.
 */
export const stringifyDomainQueryObject: ( q: DomainSuggestionQuery ) => string =
	deterministicStringify;

/**
 * Formats the domain suggestion price according to 'format-currency' package rules
 * We use this for consistency in prices formats across plans and domains
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
		vendor: 'variation2_front',

		// Merge options
		...queryOptions,

		// Add the search query
		query: search.trim().toLocaleLowerCase(),
	};
}
