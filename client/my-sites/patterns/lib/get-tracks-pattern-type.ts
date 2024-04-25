import { PatternType, PatternTypeFilter } from '../types';

export const getTracksPatternType = (
	patternTypeFilter?: PatternTypeFilter
): PatternType | undefined => {
	if ( ! patternTypeFilter ) {
		return undefined;
	}

	return patternTypeFilter === PatternTypeFilter.REGULAR ? 'pattern' : 'page-layout';
};
