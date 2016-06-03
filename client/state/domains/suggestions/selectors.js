/**
 * Internal dependencies
 */
import { getSerializedDomainsSuggestionsQuery } from './utils';

/**
 * Returns domains suggestions information for a query.
 * @param   {Object}   state                                Global state tree
 * @param   {Object}   queryObject                          domain suggestions queryObject
 * @param   {String}   queryObject.query                    domainQuery
 * @param   {Number}   queryObject.quantity                 max results
 * @param   {String}   queryObject.vendor                   vendor
 * @param   {?Boolean} queryObject.includeSubdomain         adds wordpress subdomain suggestions when true
 * @returns {?Array}   domain suggestions array
 */
export function getDomainsSuggestions( state, queryObject ) {
	const serializedQuery = getSerializedDomainsSuggestionsQuery( queryObject );
	if ( serializedQuery ) {
		return state.domains.suggestions.items[ serializedQuery ];
	}
	return null;
}

/**
 * Returns true, if we're currently requesting domains suggestions.
 * @param   {Object}     state                                Global state tree
 * @param   {Object}     queryObject                          domain suggestions queryObject
 * @param   {String}     queryObject.query                    domainQuery
 * @param   {Number}     queryObject.quantity                 max results
 * @param   {String}     queryObject.vendor                   vendor
 * @param   {?Boolean}   queryObject.includeSubdomain  adds wordpress subdomain suggestions when true
 * @returns {Boolean}   true if requesting
 */
export function isRequestingDomainsSuggestions( state, queryObject ) {
	const serializedQuery = getSerializedDomainsSuggestionsQuery( queryObject );
	if ( serializedQuery ) {
		return !! state.domains.suggestions.requesting[ serializedQuery ];
	}
	return false;
}

/**
 * Returns an error for a given domains suggestions query.
 * @param   {Object}     state                                Global state tree
 * @param   {Object}     queryObject                          domain suggestions queryObject
 * @param   {String}     queryObject.query                    domainQuery
 * @param   {Number}     queryObject.quantity                 max results
 * @param   {String}     queryObject.vendor                   vendor
 * @param   {?Boolean}   queryObject.includeSubdomain  adds wordpress subdomain suggestions when true
 * @returns {?Object}    error or null
 */
export function getDomainsSuggestionsError( state, queryObject ) {
	const serializedQuery = getSerializedDomainsSuggestionsQuery( queryObject );
	if ( serializedQuery ) {
		return state.domains.suggestions.errors[ serializedQuery ] || null;
	}
	return null;
}
