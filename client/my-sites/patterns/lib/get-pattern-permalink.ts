import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter, Category, Pattern } from 'calypso/my-sites/patterns/types';

// We intentionally disregard grid view when generating pattern permalinks. Our assumption is that
// it will be more confusing for users to land in grid view when they have a single-pattern permalink
export function getPatternPermalink(
	pattern: Pattern,
	activeCategory: string,
	patternTypeFilter: PatternTypeFilter,
	categories: Category[]
) {
	// Get the first pattern category that is also included in the `usePatternCategories` data
	const patternCategory = Object.keys( pattern.categories ).find( ( categorySlug ) =>
		categories.find( ( { name } ) => name === categorySlug )
	);
	const pathname = getCategoryUrlPath( activeCategory || patternCategory || '', patternTypeFilter );

	const url = new URL( pathname, location.origin );
	url.hash = `#pattern-${ pattern.ID }`;
	return url.toString();
}
