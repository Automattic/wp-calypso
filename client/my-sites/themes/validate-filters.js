/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { isValidTerm, sortFilterTerms } from './theme-filters';

// Reorder and remove invalid filters to redirect to canonical URL
module.exports = function validateFilter( context, next ) {
	// Page.js replaces + with \s
	const filterParam = context.params.filter.replace( /\s/g, '+' );

	// Accept commas, which were previously used as canonical filter separators
	const validFilters = filterParam.split( /[,+]/ ).filter( isValidTerm );
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
};

