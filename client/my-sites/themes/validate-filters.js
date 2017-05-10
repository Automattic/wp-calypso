/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { sortFilterTerms } from './theme-filters';
import { getThemeFilterTerm, isValidThemeFilterTerm } from 'state/selectors';

// Reorder and remove invalid filters to redirect to canonical URL
export function validateFilters( context, next ) {
	if ( ! context.params.filter ) {
		return next();
	}

	// Page.js replaces + with \s
	const filterParam = context.params.filter.replace( /\s/g, '+' );

	// Accept commas, which were previously used as canonical filter separators
	const validFilters = filterParam.split( /[,+]/ ).filter( term => isValidThemeFilterTerm( context.store.getState(), term ) );
	const sortedValidFilters = sortFilterTerms( validFilters ).join( '+' );

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
	const { store } = context;

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
