/**
 * Constants
 */
const ONE_YEAR_IN_MILLISECONDS = 31540000000;

export const getBaseTime = () => Date.now() + ONE_YEAR_IN_MILLISECONDS;
export const getTransientDate = ( baseTime = getBaseTime(), index = 0, fileCount = 1 ) =>
	new Date( baseTime - ( fileCount - index ) ).toISOString();
