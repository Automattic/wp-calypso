import { generateAdminSections } from '@automattic/data-stores';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useCustomizerUrls } from './use-customizer-url';
import { useSiteSlug } from './use-site-slug';

/**
 * Returns a filtered site admin collection.
 * @param searchTerm The search term
 * @param collection A collection of site admin objects
 * @param limit The maximum number of filtered results to return
 * @returns A filtered (or empty) array
 */
export function filterListBySearchTerm(
	searchTerm = '',
	collection: ReturnType< typeof generateAdminSections > = [],
	limit = 4,
	locale = 'en'
) {
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

	const exactMatches: typeof collection = [];
	const partialMatches: typeof collection = [];
	const synonymMatches: typeof collection = [];

	collection.forEach( ( item ) => {
		if ( item.title.toLowerCase() === searchTerm.toLowerCase() ) {
			exactMatches.push( item );
		} else if ( searchRegex.test( item.title ) ) {
			partialMatches.push( item );
		} else if ( 'en' === locale && item.synonyms?.some( ( s ) => searchTermWords.includes( s ) ) ) {
			synonymMatches.push( item );
		}
	} );

	return [ ...exactMatches, ...partialMatches, ...synonymMatches ].slice( 0, limit );
}

export function useAdminResults( searchTerm: string ) {
	const siteSlug = useSiteSlug();
	const customizerUrls = useCustomizerUrls();
	const { googleMailServiceFamily, locale, onboardingUrl } = useHelpCenterContext();

	if ( siteSlug ) {
		const sections = generateAdminSections(
			siteSlug,
			customizerUrls,
			googleMailServiceFamily,
			onboardingUrl
		);
		const filteredSections = filterListBySearchTerm( searchTerm, sections, 4, locale );

		return filteredSections;
	}
	return [];
}
