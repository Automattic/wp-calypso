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

const normalize = ( value: number, start: number ): number => {
	// Some properties should return 0 if the value is not present (eg: redirectStart if there are no redirect)
	// We need this check to avoid sending negative numbers.
	if ( value === 0 ) return 0;
	return value - start;
};

export const collector: Collector = ( report ) => {
	// Ensure these values are relative to the beginning of the report
	report.data.set( 'navigationStart', normalize( getNavigationStart(), report.start ) );
	report.data.set( 'unloadEventStart', normalize( getUnloadEventStart(), report.start ) );
	report.data.set( 'unloadEventEnd', normalize( getUunloadEventEnd(), report.start ) );
	report.data.set( 'redirectStart', normalize( getRedirectStart(), report.start ) );
	report.data.set( 'redirectEnd', normalize( getRedirectEnd(), report.start ) );
	report.data.set( 'fetchStart', normalize( getFetchStart(), report.start ) );
	report.data.set( 'domainLookupStart', normalize( getDomainLookupStart(), report.start ) );
	report.data.set( 'domainLookupEnd', normalize( getDomainLookupEnd(), report.start ) );
	report.data.set( 'connectStart', normalize( getConnectStart(), report.start ) );
	report.data.set( 'connectEnd', normalize( getConnectEnd(), report.start ) );
	report.data.set( 'secureConnectionStart', normalize( getSecureConnectionStart(), report.start ) );
	report.data.set( 'requestStart', normalize( getRequestStart(), report.start ) );
	report.data.set( 'responseEnd', normalize( getResponseEnd(), report.start ) );
	report.data.set( 'domLoading', normalize( getDomLoading(), report.start ) );
	report.data.set( 'domInteractive', normalize( getDomInteractive(), report.start ) );
	report.data.set(
		'domContentLoadedEventStart',
		normalize( getDomContentLoadedEventStart(), report.start )
	);
	report.data.set(
		'domContentLoadedEventEnd',
		normalize( getDomContentLoadedEventEnd(), report.start )
	);
	report.data.set( 'domComplete', normalize( getDomComplete(), report.start ) );
	report.data.set( 'loadEventStart', normalize( getLoadEventStart(), report.start ) );
	report.data.set( 'loadEventEnd', normalize( getloadEventEnd(), report.start ) );
	return report;
};
