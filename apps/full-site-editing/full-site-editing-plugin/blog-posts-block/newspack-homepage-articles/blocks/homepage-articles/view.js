/**
 * VIEW
 * JavaScript used on front of site.
 */

/**
 * Style dependencies
 */
import './view.scss';

const fetchRetryCount = 3;

/**
 * Load More Button Handling
 *
 * Calls Array.prototype.forEach for IE11 compatibility.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
 */
Array.prototype.forEach.call(
	document.querySelectorAll( '.wp-block-newspack-blocks-homepage-articles.has-more-button' ),
	buildLoadMoreHandler
);

/**
 * Builds a function to handle clicks on the load more button.
 * Creates internal state via closure to ensure all state is
 * isolated to a single Block + button instance.
 *
 * @param {HTMLElement} blockWrapperEl the button that was clicked
 */
function buildLoadMoreHandler( blockWrapperEl ) {
	const btnEl = blockWrapperEl.querySelector( '[data-next]' );
	if ( ! btnEl ) {
		return;
	}
	const postsContainerEl = blockWrapperEl.querySelector( '[data-posts]' );

	// Set initial state flags.
	let isFetching = false;
	let isEndOfData = false;

	btnEl.addEventListener( 'click', () => {
		// Early return if still fetching or no more posts to render.
		if ( isFetching || isEndOfData ) {
			return false;
		}

		isFetching = true;

		blockWrapperEl.classList.remove( 'is-error' );
		blockWrapperEl.classList.add( 'is-loading' );

		// Set currently rendered posts' IDs as a query param (e.g. exclude_ids=1,2,3)
		const requestURL =
			btnEl.getAttribute( 'data-next' ) + '&exclude_ids=' + getRenderedPostsIds().join( ',' );

		fetchWithRetry( { url: encodeURI( requestURL ), onSuccess, onError }, fetchRetryCount );

		/**
		 * @param {Object} data Post data
		 */
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
				btnEl.setAttribute( 'data-next', data.next );
			}

			if ( ! data.items.length || ! data.next ) {
				isEndOfData = true;
				blockWrapperEl.classList.remove( 'has-more-button' );
			}

			isFetching = false;

			blockWrapperEl.classList.remove( 'is-loading' );
		}

		/**
		 * Handle fetching error
		 */
		function onError() {
			isFetching = false;

			blockWrapperEl.classList.remove( 'is-loading' );
			blockWrapperEl.classList.add( 'is-error' );
		}
	} );
}

/**
 * Returns unique IDs for posts that are currently in the DOM.
 */
function getRenderedPostsIds() {
	const postEls = document.querySelectorAll(
		'.wp-block-newspack-blocks-homepage-articles [data-post-id]'
	);
	const postIds = Array.from( postEls ).map( el => el.getAttribute( 'data-post-id' ) );

	return [ ...new Set( postIds ) ]; // Make values unique with Set
}

/**
 * Wrapper for XMLHttpRequest that performs given number of retries when error
 * occurs.
 *
 * @param {Object} options XMLHttpRequest options
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
 * @param {Object} data posts endpoint payload
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
 * Checks if object has own property.
 *
 * @param {Object} obj Object
 * @param {string} prop Property to check
 */
function hasOwnProp( obj, prop ) {
	return Object.prototype.hasOwnProperty.call( obj, prop );
}
