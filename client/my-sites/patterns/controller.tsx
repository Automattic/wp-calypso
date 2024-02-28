import { PATTERN_CATEGORIES } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';

export function getPatternCategorySlugs() {
	return PATTERN_CATEGORIES.join( '|' );
}
