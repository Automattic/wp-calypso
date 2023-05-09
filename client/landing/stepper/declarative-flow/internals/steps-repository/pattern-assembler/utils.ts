import {
	DEFAULT_GLOBAL_STYLES_VARIATION_TITLE,
	GlobalStylesVariationType,
} from '@automattic/global-styles';
import { PATTERN_SOURCE_SITE_ID, CATEGORY_ALL_SLUG } from './constants';
import type { GlobalStylesObject } from '@automattic/global-styles';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const decodePatternId = ( encodedPatternId: number | string ) =>
	`${ encodedPatternId }`.split( '-' )[ 0 ];

export const getVariationTitle = ( variation: GlobalStylesObject | null ) =>
	variation?.title ?? DEFAULT_GLOBAL_STYLES_VARIATION_TITLE;

export const getVariationType = (
	variation: GlobalStylesObject | null
): GlobalStylesVariationType =>
	variation && variation.title !== DEFAULT_GLOBAL_STYLES_VARIATION_TITLE
		? GlobalStylesVariationType.Premium
		: GlobalStylesVariationType.Free;

export const getCategoryName = ( name?: string ) => ( name === CATEGORY_ALL_SLUG ? 'all' : name );
