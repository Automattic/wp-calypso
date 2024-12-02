import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';

export const useReportCompletedEffect = ( url: string, hash: string ) => {
	useEffect( () => {
		if ( performance.getEntriesByName( 'test-started' ).length > 0 ) {
			performance.mark( 'test-completed' );
			const testMeasure = performance.measure( 'test-duration', 'test-started', 'test-completed' );
			recordTracksEvent( 'calypso_performance_profiler_test_completed', {
				url,
				hash,
				duration: testMeasure?.duration ?? undefined,
				version: profilerVersion(),
			} );
		}
	}, [ url, hash ] );
};
