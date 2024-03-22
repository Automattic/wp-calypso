import { PatternType, PatternTypeFilter } from '../types';

export const getTracksPatternType = ( patternTypeFilter: PatternTypeFilter ): PatternType =>
	patternTypeFilter === PatternTypeFilter.REGULAR ? 'pattern' : 'page-layout';
