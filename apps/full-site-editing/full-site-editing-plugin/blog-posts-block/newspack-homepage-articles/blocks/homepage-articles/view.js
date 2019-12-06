/**
 * VIEW
 * JavaScript used on front of site.
 */

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

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
	/**
	 * Set elements from scope determined by the clicked "Load more" button.
	 */
	const blockWrapperEl = btnEl.parentElement; // scope root element
	const postsContainerEl = blockWrapperEl.querySelector( '[data-posts-container]' );
	const loadingEl = blockWrapperEl.querySelector( '[data-load-more-loading-text]' );
	const errorEl = blockWrapperEl.querySelector( '[data-load-more-error-text]' );

	/**
	 * Set initial state flags.
	 */
	let isFetching = false;
	let isEndOfData = false;

	return () => {
		/**
		 * Early return if still fetching or no more posts to render.
		 */
		if ( isFetching || isEndOfData ) {
			return false;
		}

		isFetching = true;

		/**
		 * Set elements visibility for fetching state.
		 */
		hideEl( btnEl );
		hideEl( errorEl );
		showEl( loadingEl );

		apiFetchWithRetry( { url: btnEl.getAttribute( btnURLAttr ) }, fetchRetryCount )
			.then( data => {
				/**
				 * Validate received data.
				 */
				if ( ! isPostsDataValid( data ) ) {
					throw new Error( 'Invalid response data' );
				}

				/**
				 * Render posts' HTML from string.
				 */
				const postsHTML = data.items.map( item => item.html ).join( '' );
				postsContainerEl.insertAdjacentHTML( 'beforeend', postsHTML );

				if ( data.next ) {
					/**
					 * Save next URL as button's attribute.
					 */
					btnEl.setAttribute( btnURLAttr, data.next );

					/**
					 * Unhide button since there are more posts available.
					 */
					showEl( btnEl );
				} else {
					isEndOfData = true;
				}

				isFetching = false;

				hideEl( loadingEl );
			} )
			.catch( () => {
				isFetching = false;

				/**
				 * Display error message and keep the button visible to enable retrying.
				 */
				hideEl( loadingEl );
				showEl( errorEl );
				showEl( btnEl );
			} );
	};
}

/**
 * Wrapper for api-fetch that performs given number of retries when error
 * occurs.
 *
 * @param {Object} options api-fetch options
 * @param {Number} n retry count before throwing
 */
function apiFetchWithRetry( options, n ) {
	return apiFetch( options ).catch( error => {
		if ( n === 1 ) {
			throw error;
		}

		return apiFetchWithRetry( options, n - 1 );
	} );
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
	if (
		data &&
		hasOwnProp( data, 'items' ) &&
		hasOwnProp( data, 'next' ) &&
		Array.isArray( data.items ) &&
		data.items.length &&
		hasOwnProp( data.items[ 0 ], 'html' ) &&
		typeof data.items[ 0 ].html === 'string'
	) {
		return true;
	}

	return false;
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
 * @param {Object} obj
 * @param {String} prop
 */
function hasOwnProp( obj, prop ) {
	return Object.prototype.hasOwnProperty.call( obj, prop );
}
