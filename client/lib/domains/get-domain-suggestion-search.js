/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getFixedDomainSearch } from './get-fixed-domain-search';

/*
 * Given a search string, strip anything we don't want to query for domain suggestions
 *
 * @param {string} search Original search string
 * @param {integer} minLength Minimum search string length
 * @returns {string} Cleaned search string
 */
export function getDomainSuggestionSearch( search, minLength = 2 ) {
	const cleanedSearch = getFixedDomainSearch( search );

	// Ignore any searches that are too short
	if ( cleanedSearch.length < minLength ) {
		return '';
	}

	// Ignore any searches for generic URL prefixes
	// getFixedDomainSearch will already have stripped http(s):// and www.
	const ignoreList = [ 'www', 'http', 'https' ];
	if ( includes( ignoreList, cleanedSearch ) ) {
		return '';
	}

	return cleanedSearch;
}
