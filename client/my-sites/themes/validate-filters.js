// TODO (seear): This middleware should be made isomorphic once we
// have a solution for isomorphic redirects.

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
	const filterParam = context.params.filter;
	const validFilters = filterParam.split( ',' ).filter( isValidTerm );
	const sortedValidFilters = sortFilterTerms( validFilters ).join( ',' );

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

