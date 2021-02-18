/**
 * External dependencies
 */
import deterministicStringify from 'fast-json-stable-stringify';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import type { DomainSuggestionQuery } from './types';

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
