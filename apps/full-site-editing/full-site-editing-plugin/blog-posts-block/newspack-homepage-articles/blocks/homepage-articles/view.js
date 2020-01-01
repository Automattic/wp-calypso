/**
 * VIEW
 * JavaScript used on front of site.
 */

/**
 * Style dependencies
 */
import './view.scss';

const btnURLAttr = 'data-load-more-url';
const fetchRetryCount = 3;

/**
 * Load More Button Handling
 */

document.querySelectorAll( '[data-load-more-btn]' ).forEach( attachLoadMoreHandler );

/**
 * Attaches an event handler to the Load more button.
 * @param {DOMElement} btnEl the button that was clicked
 */
function attachLoadMoreHandler( btnEl ) {
	if ( ! btnEl ) {
		return null;
	}

	const handler = buildLoadMoreHandler( btnEl );

	btnEl.addEventListener( 'click', handler );
}

/**
 * Builds a function to handle clicks on the load more button.
 * Creates internal state via closure to ensure all state is
 * isolated to a single Block + button instance.
 *
 * @param {DOMElement} btnEl the button that was clicked
 */
function buildLoadMoreHandler( btnEl ) {
	// Set elements from scope determined by the clicked "Load more" button.
	const blockWrapperEl = btnEl.parentElement; // scope root element
	const postsContainerEl = blockWrapperEl.querySelector( '[data-posts-container]' );
	const loadingEl = blockWrapperEl.querySelector( '[data-load-more-loading-text]' );
	const errorEl = blockWrapperEl.querySelector( '[data-load-more-error-text]' );

	// Set initial state flags.
	let isFetching = false;
	let isEndOfData = false;

	return () => {
		// Early return if still fetching or no more posts to render.
		if ( isFetching || isEndOfData ) {
			return false;
		}

		isFetching = true;

		// Set elements visibility for fetching state.
		hideEl( btnEl );
		hideEl( errorEl );
		showEl( loadingEl );

		const requestURL = new URL( btnEl.getAttribute( btnURLAttr ) );

		// Set currenty rendered posts' IDs as a query param (e.g. exclude_ids=1,2,3)
		requestURL.searchParams.set( 'exclude_ids', getRenderedPostsIds().join( ',' ) );

		fetchWithRetry( { url: requestURL.toString(), onSuccess, onError }, fetchRetryCount );

		function onSuccess( data ) {
			// Validate received data.
			if ( ! isPostsDataValid( data ) ) {
				return onError();
			}

			if ( data.items.length ) {
				// Render posts' HTML from string.
				const postsHTML = data.items.map( item => item.html ).join( '' );
				postsContainerEl.insertAdjacentHTML( 'beforeend', postsHTML );
			}

			if ( data.next ) {
				// Save next URL as button's attribute.
				btnEl.setAttribute( btnURLAttr, data.next );

				// Unhide button since there are more posts available.
				showEl( btnEl );
			}

			if ( ! data.items.length || ! data.next ) {
				isEndOfData = true;
			}

			isFetching = false;

			hideEl( loadingEl );
		}

		function onError() {
			isFetching = false;

			// Display error message and keep the button visible to enable retrying.
			hideEl( loadingEl );
			showEl( errorEl );
			showEl( btnEl );
		}
	};
}

/**
 * Returns unique IDs for posts that are currently in the DOM.
 */
function getRenderedPostsIds() {
	const postEls = document.querySelectorAll( 'article[data-post-id]' );
	const postIds = Array.from( postEls ).map( el => el.getAttribute( 'data-post-id' ) );

	return [ ...new Set( postIds ) ]; // Make values unique with Set
}

/**
 * Wrapper for XMLHttpRequest that performs given number of retries when error
 * occurs.
 *
 * @param {object} options XMLHttpRequest options
 * @param {number} n retry count before throwing
 */
function fetchWithRetry( options, n ) {
	const xhr = new XMLHttpRequest();

	xhr.onreadystatechange = () => {
		// Return if the request is completed.
		if ( xhr.readyState !== 4 ) {
			return;
		}

		// Call onSuccess with parsed JSON if the request is successful.
		if ( xhr.status >= 200 && xhr.status < 300 ) {
			const data = JSON.parse( xhr.responseText );

			return options.onSuccess( data );
		}

		// Call onError if the request has failed n + 1 times (or if n is undefined).
		if ( ! n ) {
			return options.onError();
		}

		// Retry fetching if request has failed and n > 0.
		return fetchWithRetry( options, n - 1 );
	};

	xhr.open( 'GET', options.url );
	xhr.send();
}

/**
 * Validates the "Load more" posts endpoint schema:
 * {
 * 	"type": "object",
 * 	"properties": {
 * 		"items": {
 * 			"type": "array",
 * 			"items": {
 * 				"type": "object",
 * 				"properties": {
 * 					"html": {
 * 						"type": "string"
 * 					}
 * 				},
 * 				"required": ["html"]
 * 			},
 * 			"required": ["items"]
 * 		},
 * 		"next": {
 * 			"type": ["string", "null"]
 * 		}
 * 	},
 * 	"required": ["items", "next"]
 * }
 *
 * @param {object} data posts endpoint payload
 */
function isPostsDataValid( data ) {
	let isValid = false;

	if (
		data &&
		hasOwnProp( data, 'items' ) &&
		Array.isArray( data.items ) &&
		hasOwnProp( data, 'next' ) &&
		typeof data.next === 'string'
	) {
		isValid = true;

		if (
			data.items.length &&
			! ( hasOwnProp( data.items[ 0 ], 'html' ) && typeof data.items[ 0 ].html === 'string' )
		) {
			isValid = false;
		}
	}

	return isValid;
}

/**
 * Hides given DOM element.
 *
 * @param {DOMElement} el
 */
function hideEl( el ) {
	el.style.display = 'none';
	el.setAttribute( 'hidden', '' );
}

/**
 * Unhides given DOM element.
 *
 * @param {DOMElement} el
 */
function showEl( el ) {
	el.style.display = '';
	el.removeAttribute( 'hidden' );
}

/**
 * Checks if object has own property.
 *
 * @param {object} obj
 * @param {string} prop
 */
function hasOwnProp( obj, prop ) {
	return Object.prototype.hasOwnProperty.call( obj, prop );
}
