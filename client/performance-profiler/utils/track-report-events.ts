import { PageSpeedReport } from 'calypso/data/site-profiler/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { profilerVersion } from './profiler-version';

export const trackReportCompletedEvent = ( report: PageSpeedReport, url: string, hash: string ) => {
	if ( typeof report.mobile === 'string' || typeof report.desktop === 'string' ) {
		return;
	}

	if ( performance.getEntriesByName( 'test-started' ).length > 0 ) {
		performance.mark( 'test-completed' );
		const testMeasure = performance.measure( 'test-duration', 'test-started', 'test-completed' );
		performance.clearMarks( 'test-started' );
		recordTracksEvent( 'calypso_performance_profiler_test_completed', {
			url,
			hash,
			duration: Math.round( testMeasure.duration ),
			version: profilerVersion(),
			mobile_score: report.mobile.overall_score,
			desktop_score: report.desktop.overall_score,
		} );
	}
};
