/**
 * External dependencies
 */
import { intersection, words } from 'lodash';

/**
 * Internal dependencies
 */
import { adminSections } from 'blocks/inline-help/admin-sections';
import { getLocaleSlug } from 'lib/i18n-utils';

/**
 * Returns a filtered site admin collection.
 *
 * @param   {String} searchTerm The search term
 * @param   {Array}  collection A collection of site admin objects
 * @param   {Number} limit      The maximum number of results to show
 * @returns {Array}             A filtered (or empty) array
 */
export function filterListBySearchTerm( searchTerm = '', collection = [], limit = 4 ) {
	const searchTermWords = words( searchTerm ).map( ( word ) => word.toLowerCase() );

	if ( searchTermWords.length < 1 ) {
		return [];
	}

	const searchRegex = new RegExp(
		// Join a series of look aheads
		// matching full and partial works
		// Example: "Add a dom" => /(?=.*\badd\b)(?=.*\ba\b)(?=.*\bdom).+/gi
		searchTermWords
			.map( ( word, i ) =>
				// if it's the last word, don't look for a end word boundary
				// otherwise
				i + 1 === searchTermWords.length ? `(?=.*\\b${ word })` : `(?=.*\\b${ word }\\b)`
			)
			.join( '' ) + '.+',
		'gi'
	);

	return collection
		.filter( ( item ) => {
			if ( searchRegex.test( item.title ) ) {
				return true;
			}
			// Until we get the synonyms translated, just check when the language is `'en'`
			return 'en' === getLocaleSlug()
				? intersection( item.synonyms, searchTermWords ).length > 0
				: false;
		} )
		.map( ( item ) => ( { ...item, type: 'internal', key: item.title } ) )
		.slice( 0, limit );
}

/**
 * Returns a filtered site admin collection using the memoized adminSections.
 *
 * Note that the first argument `state` is not used,
 * because the admin sections are store in the admin-sections.js,
 * in the inline-block component.
 *
 * @param   {object} state  Global state tree
 * @param   {String} searchTerm The search term
 * @param   {String} siteSlug   The current site slug
 * @param   {Number} limit      The maximum number of results to show
 * @returns {Array}             A filtered (or empty) array
 */
export default function getAdminHelpResults( state, searchTerm = '', siteSlug, limit ) {
	if ( ! searchTerm ) {
		return [];
	}

	return filterListBySearchTerm( searchTerm, adminSections( siteSlug || '' ), limit );
}
