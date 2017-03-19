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
export default function validateFilter( context, next ) {
	const filterParam = context.params.filter;
	const validFilters = filterParam.split( ',' ).filter( isValidTerm );
	const sortedValidFilters = sortFilterTerms( validFilters ).join( ',' );

	if ( sortedValidFilters !== filterParam ) {
		const path = context.path;
		const newPath = path.replace(
			`/filter/${ filterParam }`,
			sortedValidFilters ? `/filter/${ sortedValidFilters }` : ''
		);
		page.redirect( newPath );
	}

	next();
};

