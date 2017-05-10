/**
* Functions for working with theme search filters. The filter syntax is
* {taxonomy}:{term}
*
* Valid values for {taxonomy} and {term} are contained in the
* `taxonomies` object.
*/

/**
 * External dependencies
 */
import { forIn, includes, isEmpty, keys, mapValues, omitBy } from 'lodash';

// Regular expressions for matching "taxonomy:term" search-box syntax
const FILTER_REGEX_STRING = '(\\w+)\\:([\\w-]*)';
const FILTER_REGEX_GLOBAL = new RegExp( FILTER_REGEX_STRING, 'g' );
const FILTER_REGEX_SINGLE = new RegExp( '^' + FILTER_REGEX_STRING + '$' );
const FILTER_TAXONOMY_GROUP = 1;
const FILTER_TERM_GROUP = 2;

let termTable;
let ambiguousTerms;
let taxonomies = {};

/**
 * Initialise this library.
 *
 * @param {Object} themeFilters data from /theme-filters endpoint
 */
export function init( themeFilters ) {
	if ( isEmpty( taxonomies ) ) {
		// strip taxonomy names and descriptions
		taxonomies = mapValues( themeFilters, keys );
	}
}

/**
 * @return {Object} [taxonomies][terms]
 */
export function getTaxonomies( ) {
	return taxonomies;
}

/**
 * @return {Object} a table of terms to taxonomies.
 */
function getTermTable() {
	if ( isEmpty( termTable ) ) {
		termTable = {};
		forIn( taxonomies, ( terms, taxonomy ) => {
			terms.forEach( ( term ) => {
				const key = isTermAmbiguous( term ) ? `${ taxonomy }:${ term }` : term;
				termTable[ key ] = taxonomy;
			} );
		} );
	}
	return termTable;
}

// Ambiguous = belongs to more than one taxonomy
function isTermAmbiguous( term ) {
	if ( ! ambiguousTerms ) {
		const ambiguousTermTable = omitBy( getTermCount(), ( count ) => count < 2 );
		ambiguousTerms = Object.keys( ambiguousTermTable );
	}
	return includes( ambiguousTerms, term );
}

function getTermCount() {
	const termCount = {};
	forIn( taxonomies, ( terms ) => {
		terms.forEach( ( term ) => {
			const count = termCount[ term ];
			termCount[ term ] = count ? count + 1 : 1;
		} );
	} );
	return termCount;
}

// return specified part of a taxonomy:term string
function splitFilter( filter, group ) {
	const match = filter.match( FILTER_REGEX_SINGLE );
	if ( match ) {
		return match[ group ];
	}
	return '';
}

// return term from a taxonomy:term string
function getTerm( filter ) {
	const term = splitFilter( filter, FILTER_TERM_GROUP );
	if ( isTermAmbiguous( term ) ) {
		return `${ getTaxonomy( filter ) }:${ term }`;
	}
	return term;
}

function stripTermPrefix( term ) {
	return term.replace( /^\w+:/, '' );
}

// return taxonomy from a taxonomy:term string
function getTaxonomy( filter ) {
	return splitFilter( filter, FILTER_TAXONOMY_GROUP );
}

/**
 * Given the 'term' part, returns a complete filter
 * in "taxonomy:term" search-box format.
 *
 * Supplied terms that belong to more than one taxonomy must be
 * prefixed taxonomy:term
 *
 * @param {string} term - the term slug
 * @return {string} - complete taxonomy:term filter, or empty string if term is not valid
 */
export function getFilter( term ) {
	const terms = getTermTable();
	if ( terms[ term ] ) {
		return `${ terms[ term ] }:${ stripTermPrefix( term ) }`;
	}
	return '';
}

/**
 * For array of terms recreate full search string in
 * "taxonomy:term taxonomy:term" search-box format.
 *
 * @param {string} terms - space or + separated list of filter terms
 * @return {string}     - complete taxonomy:term filter string, or empty string if term is not valid
 */
export function prependFilterKeys( terms ) {
	if ( terms ) {
		return terms.split( /[+\s]/ ).map( getFilter ).join( ' ' ) + ' ';
	}
	return '';
}

/**
 * Checks that a taxonomy:term filter is valid, using the theme
 * taxonomy data.
 *
 * @param {string} filter - filter in form taxonomy:term
 * @return {boolean} true if filter pair is valid
 */
export function filterIsValid( filter ) {
	return getTermTable()[ getTerm( filter ) ] === getTaxonomy( filter );
}

/**
 * Return a sorted array of filter terms.
 *
 * Sort is alphabetical on the complete "taxonomy:term" string.
 *
 * Supplied terms that belong to more than one taxonomy must be
 * prefixed taxonomy:term. Returned terms will
 * keep this prefix.
 *
 * @param {array} terms - Array of term strings
 * @return {array} sorted array
 */
export function sortFilterTerms( terms ) {
	return terms.map( getFilter ).filter( filterIsValid ).sort().map( getTerm );
}

/**
 * Return a string of valid, sorted, comma-separated filter
 * terms from an input string. Input may contain search
 * terms (which will be ignored) as well as filters.
 *
 * Returned terms that belong to more than one taxonomy will be
 * prefixed taxonomy:term
 *
 * @param {string} input - the string to parse
 * @return {string} comma-seperated list of valid filters
 */
export function getSortedFilterTerms( input ) {
	const matches = input.match( FILTER_REGEX_GLOBAL );
	if ( matches ) {
		const terms = matches.filter( filterIsValid ).map( getTerm );
		return sortFilterTerms( terms ).join( '+' );
	}
	return '';
}

/**
 * Strips any "taxonomy:term" filter strings from the input.
 *
 * @param {string} input - the string to parse
 * @return {string} input string minus any filters
 */
export function stripFilters( input ) {
	const withoutFilters = input.replace( FILTER_REGEX_GLOBAL, '' ).trim();
	return withoutFilters.replace( /\s+/g, ' ' );
}
