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
	getResponseStart,
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
	if ( value === 0 ) {
		return 0;
	}
	return value - start;
};

export const collector: Collector = ( report ) => {
	// Ensure these values are relative to the beginning of the report
	report.data.set( 'navigationStart', normalize( getNavigationStart(), report.beginning ) );
	report.data.set( 'unloadEventStart', normalize( getUnloadEventStart(), report.beginning ) );
	report.data.set( 'unloadEventEnd', normalize( getUunloadEventEnd(), report.beginning ) );
	report.data.set( 'redirectStart', normalize( getRedirectStart(), report.beginning ) );
	report.data.set( 'redirectEnd', normalize( getRedirectEnd(), report.beginning ) );
	report.data.set( 'fetchStart', normalize( getFetchStart(), report.beginning ) );
	report.data.set( 'domainLookupStart', normalize( getDomainLookupStart(), report.beginning ) );
	report.data.set( 'domainLookupEnd', normalize( getDomainLookupEnd(), report.beginning ) );
	report.data.set( 'connectStart', normalize( getConnectStart(), report.beginning ) );
	report.data.set( 'connectEnd', normalize( getConnectEnd(), report.beginning ) );
	report.data.set(
		'secureConnectionStart',
		normalize( getSecureConnectionStart(), report.beginning )
	);
	report.data.set( 'requestStart', normalize( getRequestStart(), report.beginning ) );
	report.data.set( 'responseStart', normalize( getResponseStart(), report.beginning ) );
	report.data.set( 'responseEnd', normalize( getResponseEnd(), report.beginning ) );
	report.data.set( 'domLoading', normalize( getDomLoading(), report.beginning ) );
	report.data.set( 'domInteractive', normalize( getDomInteractive(), report.beginning ) );
	report.data.set(
		'domContentLoadedEventStart',
		normalize( getDomContentLoadedEventStart(), report.beginning )
	);
	report.data.set(
		'domContentLoadedEventEnd',
		normalize( getDomContentLoadedEventEnd(), report.beginning )
	);
	report.data.set( 'domComplete', normalize( getDomComplete(), report.beginning ) );
	report.data.set( 'loadEventStart', normalize( getLoadEventStart(), report.beginning ) );
	report.data.set( 'loadEventEnd', normalize( getloadEventEnd(), report.beginning ) );
	return report;
};
