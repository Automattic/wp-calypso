import { isEnabled } from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { getPatternSourceSiteID } from './constants';
import type { Pattern, Category } from './types';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ getPatternSourceSiteID() }`;

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

export const isPriorityPattern = ( { categories, tags: { assembler_priority } }: Pattern ) =>
	isEnabled( 'pattern-assembler/v2' )
		? categories.featured || categories.footer || categories.header
		: Boolean( assembler_priority );

export const isPagePattern = ( { categories, tags: { assembler_page } }: Pattern ) =>
	Boolean( isEnabled( 'pattern-assembler/v2' ) ? categories.page : assembler_page );

export const getTitleForRenamedCategories = ( category: Category = {} ) => {
	const { slug, title } = category;
	if ( 'posts' === slug ) {
		return translate( 'Blog' );
	}
	return title;
};

export const getPagePatternTitle = ( { categories }: Pattern ) => {
	const category = ( Object.values( categories ) as Category[] ).find(
		( { slug } ) => 'page' !== slug && 'featured' !== slug
	);
	return getTitleForRenamedCategories( category );
};
