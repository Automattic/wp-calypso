import { CATEGORY_PAGE } from 'calypso/my-sites/patterns/constants';
import { PatternTypeFilter, Pattern } from 'calypso/my-sites/patterns/types';

export function filterPatternsByType( patterns: Pattern[], type: PatternTypeFilter ) {
	return patterns.filter( ( pattern ) => {
		const categorySlugs = Object.keys( pattern.categories );
		const isPage = categorySlugs.includes( CATEGORY_PAGE );

		return type === PatternTypeFilter.PAGES ? isPage : ! isPage;
	} );
}
