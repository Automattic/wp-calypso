type MessageAction = 'checkoutCompleted' | 'checkoutFailed' | 'checkoutCancelled';

// Check whether the current window is in the popup.
export const isPopup = () =>
	typeof window !== 'undefined' && window.opener && window.opener !== window;

// Send the message to the opener.
export const sendMessageToOpener = ( siteSlug: string, action: MessageAction ) => {
	if ( ! isPopup() ) {
		return false;
	}
	if ( ! siteSlug ) {
		return false;
	}

	window.opener.postMessage( { action }, `https://${ siteSlug }` );
	return true;
};
