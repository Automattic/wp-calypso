import { PATTERN_SOURCE_SITE_ID, CATEGORY_ALL_SLUG } from './constants';
import type { Pattern, Category } from './types';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const decodePatternId = ( encodedPatternId: number | string ) =>
	`${ encodedPatternId }`.split( '-' )[ 0 ];

export const replaceCategoryAllName = ( name?: string ) =>
	name === CATEGORY_ALL_SLUG ? 'all' : name;

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
	let category = categories.find( ( { name } ) => {
		if ( selectedCategory === CATEGORY_ALL_SLUG ) {
			return name === firstCategory;
		}
		return name === ( selectedCategory || firstCategory );
	} );

	if ( selectedCategory === CATEGORY_ALL_SLUG ) {
		// Use 'all' rather than 'featured' as slug for tracks.
		// Use the first category label as selected pattern name.
		category = {
			name: 'all',
			label: pattern.category?.label,
		};
	}

	pattern.category = category;
	return pattern;
};
