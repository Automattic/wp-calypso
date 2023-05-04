import page from 'page';
import { composeHandlers } from 'calypso/controller/shared';
import performanceMark from 'calypso/server/lib/performance-mark';
import {
	getThemeFilterStringFromTerm,
	getThemeFilterTerm,
	getThemeFilterTermFromString,
	isAmbiguousThemeFilterTerm,
	isValidThemeFilterTerm,
} from 'calypso/state/themes/selectors';
import { fetchThemeFilters, redirectToThemeDetails } from './controller';

// Reorder and remove invalid filters to redirect to canonical URL
export function validateFilters( context, next ) {
	performanceMark( context, 'validateThemeFilters' );
	if ( ! context.params.filter ) {
		return next();
	}

	const { params, store } = context;
	const state = store.getState();

	// Page.js replaces + with \s
	// Accept commas, which were previously used as canonical filter separators.
	const filterParam = params.filter.replace( /\s/g, '+' );
	let filterArray = filterParam.split( /[,+]/ );

	// Rewrite ambiguous filters.
	const tryMatchPrefixes = [ 'subject', 'column', 'style', 'color', 'feature' ];
	filterArray = filterArray.map( ( term ) => {
		let matchedPrefix;
		if ( isAmbiguousThemeFilterTerm( state, term ) ) {
			matchedPrefix = tryMatchPrefixes.find( ( prefix ) =>
				isValidThemeFilterTerm( state, `${ prefix }:${ term }` )
			);
		}

		return matchedPrefix ? `${ matchedPrefix }:${ term }` : term;
	} );

	const validFilters = filterArray.filter( ( term ) => isValidThemeFilterTerm( state, term ) );
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
	performanceMark( context, 'validateVertical' );
	const { vertical, tier, filter, site_id } = context.params;
	const { store } = context;

	if ( ! vertical ) {
		return next();
	}

	if ( ! getThemeFilterTerm( store.getState(), 'subject', vertical ) ) {
		if ( context.isServerSide ) {
			return next( 'route' );
		}

		/**
		 * This applies only for logged-in users since the isomorphic routing is currently disabled on production.
		 * Because next() doesn't trigger another route path (like we do in index.node.js with next('route')), we will have to do the redirect here.
		 *
		 * If the tier and filter are not present, we'll assume the vertical slug might be a theme.
		 * We need this because we cannot implement a redirect route like in express.
		 */
		if ( ! tier && ! filter ) {
			redirectToThemeDetails( page.redirect, site_id, vertical, null, next );
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
 * @param {Object} context Routing context
 * @param {Array} terms Array of term strings
 * @returns {Array} Sorted array
 */
export function sortFilterTerms( context, terms ) {
	return terms
		.map( ( term ) =>
			// getThemeFilterStringFromTerm() attempts to recreate the full filter string "taxonomy:term".
			// Thus, if the term is already the full string, we can simply return it.
			! term.includes( ':' ) ? getThemeFilterStringFromTerm( context.store.getState(), term ) : term
		)
		.sort()
		.map( ( filter ) => getThemeFilterTermFromString( context.store.getState(), filter ) );
}

export const fetchAndValidateVerticalsAndFilters = composeHandlers(
	fetchThemeFilters,
	validateVertical,
	validateFilters
);
