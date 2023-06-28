import { PATTERN_SOURCE_SITE_ID, CATEGORY_ALL_SLUG } from './constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const decodePatternId = ( encodedPatternId: number | string ) =>
	`${ encodedPatternId }`.split( '-' )[ 0 ];

export const replaceCategoryAllName = ( name?: string ) =>
	name === CATEGORY_ALL_SLUG ? 'all' : name;
