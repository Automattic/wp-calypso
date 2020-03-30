/**
 * Creates a promise that will be rejected after a given timeout
 *
 * @param {number} ms amount of milliseconds till reject the promise
 * @returns {Promise} a promise that will be rejected after ms milliseconds
 */
const createTimingOutPromise = ms =>
	new Promise( ( _, reject ) => {
		setTimeout( () => reject( new Error( `timeout of ${ ms } reached` ) ), ms );
	} );

/**
 * Makes a request to a given link in an iframe
 *
 * @param {string} loginLink the login link to load
 * @param {number} requestTimeout amount of time to allow the link to load, default 25s
 * @returns {Promise} a promise that will be resolved if the link was successfully loaded
 */
const makeRemoteLoginRequest = ( loginLink, requestTimeout = 25000 ) => {
	let iframe;
	const iframeLoadPromise = new Promise( resolve => {
		iframe = document.createElement( 'iframe' );
		iframe.style.display = 'none';
		iframe.setAttribute( 'scrolling', 'no' );
		iframe.onload = resolve;
		iframe.src = loginLink;
		document.body.appendChild( iframe );
	} );

	const removeIframe = () => {
		iframe.parentElement.removeChild( iframe );
	};

	return Promise.race( [ iframeLoadPromise, createTimingOutPromise( requestTimeout ) ] ).then(
		removeIframe,
		removeIframe
	);
};

/**
 * Fetch all remote login urls
 *
 * @param  {Array}   loginLinks     Array of urls
 * @returns {Promise}                A promise that always resolve
 */
export const remoteLoginUser = loginLinks => {
	return Promise.all(
		loginLinks
			.map( loginLink => makeRemoteLoginRequest( loginLink ) )
			// make sure we continue even when a remote login fails
			.map( promise => promise.catch( () => {} ) )
	);
};
