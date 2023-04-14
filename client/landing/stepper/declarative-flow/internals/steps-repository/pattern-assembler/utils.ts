import { DEFAULT_VARIATION_TITLE, VariationType } from '@automattic/global-styles';
import { PATTERN_SOURCE_SITE_ID } from './constants';
import type { GlobalStylesObject } from '@automattic/global-styles';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;

export const decodePatternId = ( encodedPatternId: number | string ) =>
	`${ encodedPatternId }`.split( '-' )[ 0 ];

export const getVariationTitle = ( variation: GlobalStylesObject | null ) =>
	variation?.title ?? DEFAULT_VARIATION_TITLE;

export const getVariationType = ( variation: GlobalStylesObject | null ): VariationType =>
	variation && variation.title !== DEFAULT_VARIATION_TITLE
		? VariationType.Premium
		: VariationType.Free;
