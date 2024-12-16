import { PATTERN_SOURCE_SITE_ID } from 'calypso/my-sites/patterns/constants';

export const encodePatternId = ( patternId: number ) =>
	`${ patternId }-${ PATTERN_SOURCE_SITE_ID }`;
