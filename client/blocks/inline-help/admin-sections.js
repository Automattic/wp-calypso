import { generateAdminSections } from '@automattic/data-stores';
import { createSelector } from '@automattic/state-utils';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { onboardingUrl } from 'calypso/lib/paths';
import { getCustomizerUrl, getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Returns admin section items with site-based urls.
 *
 * @param   {number} siteId   - The current site ID.
 * @param   {string} siteSlug - The current site slug.
 * @param   {Object} state    - Global state
 * @returns {Array}             An array of admin sections with site-specific URLs.
 */
export const getAdminSections = createSelector(
	( state, siteId ) => {
		const siteSlug = getSiteSlug( state, siteId );

		const sections = generateAdminSections(
			siteSlug,
			{
				root: getCustomizerUrl( state, siteId ),
				homepage: getCustomizerUrl( state, siteId, 'homepage' ),
				identity: getCustomizerUrl( state, siteId, 'identity' ),
				menus: getCustomizerUrl( state, siteId, 'menus' ),
			},
			getGoogleMailServiceFamily(),
			onboardingUrl()
		);
		return sections;
	},
	( state, siteId ) => [ getSiteSlug( state, siteId ) ]
);

/**
 * Returns a filtered site admin collection.
 *
 * @param   {string} searchTerm The search term
 * @param   {Array}  collection A collection of site admin objects
 * @param   {number} limit      The maximum number of filtered results to return
 * @returns {Array}             A filtered (or empty) array
 */
export function filterListBySearchTerm( searchTerm = '', collection = [], limit = 4 ) {
	// Early return if search term is empty.
	if ( ! searchTerm.length ) {
		return [];
	}

	const searchTermWords = searchTerm
		// Split to words.
		.split( /[\W_]+/g )
		// Eliminate any empty string results.
		.filter( Boolean )
		// Lowercase all words.
		.map( ( word ) => word.toLowerCase() );
	if ( ! searchTermWords.length ) {
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

	const exactMatches = [];
	const partialMatches = [];
	const synonymMatches = [];

	collection.forEach( ( item ) => {
		if ( item.title.toLowerCase() === searchTerm.toLowerCase() ) {
			exactMatches.push( item );
		} else if ( searchRegex.test( item.title ) ) {
			partialMatches.push( item );
		} else if (
			'en' === getLocaleSlug() &&
			item.synonyms?.some( ( s ) => searchTermWords.includes( s ) )
		) {
			synonymMatches.push( item );
		}
	} );

	return [ ...exactMatches, ...partialMatches, ...synonymMatches ].slice( 0, limit );
}
