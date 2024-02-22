type MessageAction = 'checkoutCompleted' | 'checkoutFailed' | 'checkoutCancelled';

// Check whether the current window is in the popup.
export const isPopup = () =>
	typeof window !== 'undefined' && window.opener && window.opener !== window;

function isValidHttpUrl( data: string ): boolean {
	let url;
	try {
		url = new URL( data );
	} catch ( error ) {
		return false;
	}
	return url.protocol === 'http:' || url.protocol === 'https:';
}

// Send the message to the opener.
export const sendMessageToOpener = ( siteSlug: string, action: MessageAction ) => {
	if ( ! isPopup() ) {
		return false;
	}
	if ( ! siteSlug ) {
		return false;
	}
	const targetOrigin = `https://${ siteSlug }`;
	if ( ! isValidHttpUrl( targetOrigin ) ) {
		return false;
	}

	try {
		window.opener.postMessage( { action }, targetOrigin );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `Sending action '${ action }' to window.opener failed: ${ error }` );
		return false;
	}
	return true;
};
