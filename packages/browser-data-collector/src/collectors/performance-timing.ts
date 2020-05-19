/**
 * Internal dependencies
 */
import {
	getNavigationStart,
	getUnloadEventStart,
	getUunloadEventEnd,
	getRedirectStart,
	getRedirectEnd,
	getFetchStart,
	getDomainLookupStart,
	getDomainLookupEnd,
	getConnectStart,
	getConnectEnd,
	getSecureConnectionStart,
	getRequestStart,
	getResponseEnd,
	getDomLoading,
	getDomInteractive,
	getDomContentLoadedEventStart,
	getDomContentLoadedEventEnd,
	getDomComplete,
	getLoadEventStart,
	getloadEventEnd,
} from '../api/performance-timing';

export const collector: Collector = ( report ) => {
	report.data.set( 'navigationStart', getNavigationStart() );
	report.data.set( 'unloadEventStart', getUnloadEventStart() );
	report.data.set( 'unloadEventEnd', getUunloadEventEnd() );
	report.data.set( 'redirectStart', getRedirectStart() );
	report.data.set( 'redirectEnd', getRedirectEnd() );
	report.data.set( 'fetchStart', getFetchStart() );
	report.data.set( 'domainLookupStart', getDomainLookupStart() );
	report.data.set( 'domainLookupEnd', getDomainLookupEnd() );
	report.data.set( 'connectStart', getConnectStart() );
	report.data.set( 'connectEnd', getConnectEnd() );
	report.data.set( 'secureConnectionStart', getSecureConnectionStart() );
	report.data.set( 'requestStart', getRequestStart() );
	report.data.set( 'responseEnd', getResponseEnd() );
	report.data.set( 'domLoading', getDomLoading() );
	report.data.set( 'domInteractive', getDomInteractive() );
	report.data.set( 'domContentLoadedEventStart', getDomContentLoadedEventStart() );
	report.data.set( 'domContentLoadedEventEnd', getDomContentLoadedEventEnd() );
	report.data.set( 'domComplete', getDomComplete() );
	report.data.set( 'loadEventStart', getLoadEventStart() );
	report.data.set( 'loadEventEnd', getloadEventEnd() );
	return report;
};
