/**
 * Creates a promise that will be rejected after a given timeout
 *
 * @param ms amount of milliseconds till reject the promise
 * @returns a promise that will be rejected after ms milliseconds
 */
const createTimingOutPromise = ( ms: number ) =>
	new Promise( ( _, reject ) => {
		setTimeout( () => reject( new Error( `timeout of ${ ms } reached` ) ), ms );
	} );

/**
 * Makes a request to a given link in an iframe
 *
 * @param loginLink the login link to load
 * @param requestTimeout amount of time to allow the link to load, default 25s
 * @returns a promise that will be resolved if the link was successfully loaded
 */
const makeRemoteLoginRequest = ( loginLink: string, requestTimeout = 25000 ) => {
	if ( typeof document === 'undefined' ) {
		return Promise.reject();
	}

	let iframe: HTMLIFrameElement | undefined;
	const iframeLoadPromise = new Promise( ( resolve ) => {
		iframe = document.createElement( 'iframe' );
		iframe.style.display = 'none';
		iframe.setAttribute( 'scrolling', 'no' );
		iframe.onload = resolve;
		iframe.src = loginLink;
		document.body.appendChild( iframe );
	} );

	const removeIframe = () => {
		iframe?.parentElement?.removeChild( iframe );
	};

	return Promise.race( [ iframeLoadPromise, createTimingOutPromise( requestTimeout ) ] ).then(
		removeIframe,
		removeIframe
	);
};

export const remoteLoginUser = ( loginLinks: string[] ) =>
	( { type: 'REMOTE_LOGIN_USER', loginLinks } as const );

export const controls = {
	REMOTE_LOGIN_USER: ( { loginLinks }: ReturnType< typeof remoteLoginUser > ) =>
		Promise.all(
			loginLinks
				.map( ( loginLink ) => makeRemoteLoginRequest( loginLink ) )
				// make sure we continue even when a remote login fails
				.map( ( promise ) => promise.catch( () => undefined ) )
		),
};
