document.addEventListener( 'DOMContentLoaded', function () {
	let premiumContentJWTToken = '';

	/**
	 *
	 * @param {globalThis.Event} eventFromIframe - message event that gets emitted in the checkout iframe.
	 * @listens message
	 */
	function handleIframeResult( eventFromIframe ) {
		if ( eventFromIframe.origin === 'https://subscribe.wordpress.com' && eventFromIframe.data ) {
			const data = JSON.parse( eventFromIframe.data );
			if ( data && data.result && data.result.jwt_token ) {
				// We save the token for now, doing nothing.
				premiumContentJWTToken = data.result.jwt_token;
				// We will also set this in a cookie  - just in case. This will be reloaded in the refresh, when user clicks OK.
				// But user can close the browser window before clicking OK. IN that case, we want to leave a cookie behind.
				const date = new Date();
				date.setTime( date.getTime() + 365 * 24 * 60 * 60 * 1000 );
				document.cookie =
					'jp-premium-content-session' +
					'=' +
					premiumContentJWTToken +
					'; expires=' +
					date.toGMTString() +
					'; path=/';
			}
			if ( data && data.action === 'close' && premiumContentJWTToken ) {
				document.location.href = updateQueryStringParameter(
					document.location.href,
					'token',
					premiumContentJWTToken
				);
			}
		}
	}

	function updateQueryStringParameter( uri, key, value ) {
		const re = new RegExp( '([?&])' + key + '=.*?(&|$)', 'i' );
		const separator = uri.indexOf( '?' ) !== -1 ? '&' : '?';
		if ( uri.match( re ) ) {
			return uri.replace( re, '$1' + key + '=' + value + '$2' );
		}
		return uri + separator + key + '=' + value;
	}

	if ( typeof window !== 'undefined' ) {
		window.addEventListener( 'message', handleIframeResult, false );
	}
} );
