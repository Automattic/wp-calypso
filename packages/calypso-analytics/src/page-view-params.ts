// we use this variable to track URL paths submitted to analytics.pageView.record
// so that analytics.pageLoading.record can re-use the urlPath parameter.
// this helps avoid some nasty coupling, but it's not the cleanest code - sorry.
let mostRecentUrlPath: string | null = null;

// pathCounter is used to keep track of the order of calypso_page_view Tracks
// events. The pathCounter value is appended to the last_pageview_path_with_count and
// this_pageview_path_with_count Tracks event props.
let pathCounter = 0;

if ( typeof window !== 'undefined' ) {
	window.addEventListener( 'popstate', function() {
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

export function getMostRecentUrlPath(): string | null {
	return mostRecentUrlPath;
}
