export const getNavigationStart = (): number => window?.performance?.timing?.navigationStart;
export const getUnloadEventStart = (): number => window?.performance?.timing?.unloadEventStart;
export const getUunloadEventEnd = (): number => window?.performance?.timing?.unloadEventEnd;
export const getRedirectStart = (): number => window?.performance?.timing?.redirectStart;
export const getRedirectEnd = (): number => window?.performance?.timing?.redirectEnd;
export const getFetchStart = (): number => window?.performance?.timing?.fetchStart;
export const getDomainLookupStart = (): number => window?.performance?.timing?.domainLookupStart;
export const getDomainLookupEnd = (): number => window?.performance?.timing?.domainLookupEnd;
export const getConnectStart = (): number => window?.performance?.timing?.connectStart;
export const getConnectEnd = (): number => window?.performance?.timing?.connectEnd;
export const getSecureConnectionStart = (): number =>
	window?.performance?.timing?.secureConnectionStart;
export const getRequestStart = (): number => window?.performance?.timing?.requestStart;
export const getResponseEnd = (): number => window?.performance?.timing?.responseEnd;
export const getDomLoading = (): number => window?.performance?.timing?.domLoading;
export const getDomInteractive = (): number => window?.performance?.timing?.domInteractive;
export const getDomContentLoadedEventStart = (): number =>
	window?.performance?.timing?.domContentLoadedEventStart;
export const getDomContentLoadedEventEnd = (): number =>
	window?.performance?.timing?.domContentLoadedEventEnd;
export const getDomComplete = (): number => window?.performance?.timing?.domComplete;
export const getLoadEventStart = (): number => window?.performance?.timing?.loadEventStart;
export const getloadEventEnd = (): number => window?.performance?.timing?.loadEventEnd;
