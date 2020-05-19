/**
 * Internal dependencies
 */
import {
	getCumulativeLayoutShift,
	getFirstContentfulPaint,
	getFirstInputDelay,
	getLargestContentfulPaint,
	getTimeToFirstByte,
} from '../api/web-vitals';

export const collector: Collector = async ( report ) => {
	const [ cls, fcp, fid, lcp, ttfb ] = await Promise.all( [
		getCumulativeLayoutShift(),
		getFirstContentfulPaint(),
		getFirstInputDelay(),
		getLargestContentfulPaint(),
		getTimeToFirstByte(),
	] );

	report.data.set( 'cls', cls );
	report.data.set( 'fcp', fcp );
	report.data.set( 'fid', fid );
	report.data.set( 'lcp', lcp );
	report.data.set( 'ttfb', ttfb );

	return report;
};
