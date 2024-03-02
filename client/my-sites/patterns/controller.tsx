import { PATTERN_CATEGORIES } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';

export const RENDERER_SITE_ID = 226011606; // assemblerdemo

export function getPatternCategorySlugs() {
	return PATTERN_CATEGORIES.join( '|' );
}
