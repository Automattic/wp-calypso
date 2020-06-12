/**
 * Internal dependencies
 */
import { getResources } from '../api/resources-timing';
import { getDomContentLoadedEventStart, getNavigationStart } from '../api/performance-timing';

export const collector: Collector = ( report ) => {
	const domContentLoaded = getDomContentLoadedEventStart() - getNavigationStart();
	if ( domContentLoaded <= 0 ) return report;

	/**
	 * Fetch resources that
	 * 	- are scripts
	 *  - finish downloading before domContentLoaded
	 *  - have a size (to exclude resources form a different origin)
	 */
	const blockingResources = getResources().filter(
		( r ) =>
			r.initiatorType === 'script' && r.responseEnd <= domContentLoaded && r.decodedBodySize > 0
	);

	const resourcesCount = blockingResources.length;
	const resourcesStart = blockingResources.sort( ( a, b ) => a.requestStart - b.requestStart )[ 0 ]
		.requestStart;
	const resourcesEnd = blockingResources.sort( ( a, b ) => b.requestStart - a.requestStart )[ 0 ]
		.responseEnd;

	const {
		resourcesCompressed,
		resourcesUncompressed,
		resourcesTransferred,
	} = blockingResources.reduce(
		( acc, script ) => ( {
			resourcesCompressed: acc.resourcesCompressed + script.encodedBodySize,
			resourcesUncompressed: acc.resourcesUncompressed + script.decodedBodySize,
			resourcesTransferred: acc.resourcesTransferred + script.transferSize,
		} ),
		{
			resourcesCompressed: 0,
			resourcesUncompressed: 0,
			resourcesTransferred: 0,
		}
	);

	// Hit ratio from 0 to 1 with two decimals (0=nothing was cached, 1=everything comes from the cache)
	const resourcesCacheRatio =
		1 - Math.round( ( resourcesTransferred / resourcesCompressed ) * 100 ) / 100;

	report.data.set( 'resourcesCount', resourcesCount );
	report.data.set( 'resourcesStart', resourcesStart );
	report.data.set( 'resourcesEnd', resourcesEnd );
	report.data.set( 'resourcesCompressed', resourcesCompressed );
	report.data.set( 'resourcesUncompressed', resourcesUncompressed );
	report.data.set( 'resourcesTransferred', resourcesTransferred );
	report.data.set( 'resourcesCacheRatio', resourcesCacheRatio );

	return report;
};
