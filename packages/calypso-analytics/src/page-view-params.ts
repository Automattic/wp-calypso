// We use this module state to track url paths submitted to recordTracksPageView
// `lib/analytics/index.js` also reuses it for timing.record
let mostRecentUrlPath: string | null = null;

// pathCounter is used to keep track of the order of calypso_page_view Tracks events.
let pathCounter = 0;

if ( typeof window !== 'undefined' ) {
	window.addEventListener( 'popstate', function () {
		// throw away our URL value if the user used the back/forward buttons
		mostRecentUrlPath = null;
	} );
}

interface PageViewParams {
	last_pageview_path_with_count: string;
	this_pageview_path_with_count: string;
}

export function getPageViewParams( urlPath: string ): PageViewParams {
	const params = {
		last_pageview_path_with_count: `${ mostRecentUrlPath }(${ pathCounter.toString() })`,
		this_pageview_path_with_count: `${ urlPath }(${ pathCounter + 1 })`,
	};
	// Record this path.
	mostRecentUrlPath = urlPath;
	pathCounter++;
	return params;
}

/**
 * Gets the url path which was set on the last call to getPageViewParams() and stored in module state
 * mostRecentUrlPath will be null if the page was refreshed or getPageViewParams() has not been called
 */
export function getMostRecentUrlPath(): string | null {
	return mostRecentUrlPath;
}
