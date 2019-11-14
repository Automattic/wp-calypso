/**
 * External dependencies
 */
import deterministicStringify from 'fast-json-stable-stringify';

/**
 * Internal dependencies
 */
import { DomainSuggestionQuery } from './types';

/**
 * Stable transform to an object key for storage and access.
 *
 * @TODO Should we eliminate some properties from serialization like `getSerializedDomainsSuggestionsQuery`?
 * @see client/state/domains/suggestions/utils.js
 */
export const stringifyDomainQueryObject: (
	q: DomainSuggestionQuery
) => string = deterministicStringify;
