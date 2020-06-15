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

	// Gets when the first resource starts, and when the last resource ends
	const { start: resourcesStart, end: resourcesEnd } = blockingResources.reduce(
		( { start, end }, resource ) => ( {
			start: Math.min( start, resource.requestStart ),
			end: Math.max( end, resource.responseEnd ),
		} ),
		{ start: Infinity, end: -Infinity }
	);

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
	// resourcesTransferred includes the headers, but resourcesCompressed does not. So the division is a
	// bit off and can return values higher than 1. We cap it to 1 to avoid sending negative numbers
	// and round the final result to 2 decimals.
	const resourcesCacheRatio = Number(
		( 1 - Math.min( 1, resourcesTransferred / resourcesCompressed ) ).toFixed( 2 )
	);

	report.data.set( 'resourcesCount', resourcesCount );
	report.data.set( 'resourcesStart', Math.round( resourcesStart ) );
	report.data.set( 'resourcesEnd', Math.round( resourcesEnd ) );
	report.data.set( 'resourcesCompressed', resourcesCompressed );
	report.data.set( 'resourcesUncompressed', resourcesUncompressed );
	report.data.set( 'resourcesTransferred', resourcesTransferred );
	report.data.set( 'resourcesCacheRatio', resourcesCacheRatio );

	return report;
};
