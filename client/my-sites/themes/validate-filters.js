/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	getThemeFilterStringFromTerm,
	getThemeFilterTerm,
	getThemeFilterTermFromString,
	isValidThemeFilterTerm,
} from 'state/themes/selectors';

// Reorder and remove invalid filters to redirect to canonical URL
export function validateFilters( context, next ) {
	if ( ! context.params.filter ) {
		return next();
	}

	// Page.js replaces + with \s
	const filterParam = context.params.filter.replace( /\s/g, '+' );

	// Accept commas, which were previously used as canonical filter separators
	const validFilters = filterParam
		.split( /[,+]/ )
		.filter( ( term ) => isValidThemeFilterTerm( context.store.getState(), term ) );
	const sortedValidFilters = sortFilterTerms( context, validFilters ).join( '+' );

	if ( sortedValidFilters !== filterParam ) {
		const path = context.path;
		const newPath = path.replace(
			`/filter/${ filterParam }`,
			sortedValidFilters ? `/filter/${ sortedValidFilters }` : ''
		);
		if ( context.isServerSide ) {
			return context.res.redirect( newPath );
		}
		return page.redirect( newPath );
	}

	next();
}

export function validateVertical( context, next ) {
	const { vertical } = context.params;
	const { store } = context;

	if ( ! vertical ) {
		return next();
	}

	if ( ! getThemeFilterTerm( store.getState(), 'subject', vertical ) ) {
		if ( context.isServerSide ) {
			return next( 'route' );
		}
		// Client-side: Terminate routing, rely on server-side rendered markup.
		return;
	}

	next();
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
 * @param {object} context Routing context
 * @param {Array} terms Array of term strings
 * @returns {Array} Sorted array
 */
export function sortFilterTerms( context, terms ) {
	return terms
		.map( ( term ) => getThemeFilterStringFromTerm( context.store.getState(), term ) )
		.sort()
		.map( ( filter ) => getThemeFilterTermFromString( context.store.getState(), filter ) );
}
