import { PATTERN_SOURCE_SITE_ID } from './constants';
import type { Pattern, Category } from './types';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const decodePatternId = ( encodedPatternId: number | string ) =>
	`${ encodedPatternId }`.split( '-' )[ 0 ];

export const getShuffledPattern = ( candidates: Pattern[], current: Pattern ) => {
	const filteredCandidates = candidates.filter( ( { ID } ) => ID !== current.ID );
	const shuffledIndex = Math.floor( Math.random() * filteredCandidates.length );
	return filteredCandidates[ shuffledIndex ];
};

export const injectCategoryToPattern = (
	pattern: Pattern,
	categories: Category[],
	selectedCategory?: string | null
) => {
	// Inject the selected pattern category or the first category
	// to be used in tracks and as selected pattern name.
	const [ firstCategory ] = Object.keys( pattern.categories );
	pattern.category = categories.find( ( { name } ) => {
		return name === ( selectedCategory || firstCategory );
	} );

	return pattern;
};

export const isPriorityPattern = ( { tags: { assembler_priority } }: Pattern ) =>
	!! assembler_priority;

export const isPagePattern = ( { tags: { assembler_page } }: Pattern ) => !! assembler_page;
