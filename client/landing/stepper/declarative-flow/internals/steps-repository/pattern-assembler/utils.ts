import { PATTERN_SOURCE_SITE_ID } from './constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;
