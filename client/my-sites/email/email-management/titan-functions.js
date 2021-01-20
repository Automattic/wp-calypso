/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export const fetchTitanAutoLoginURL = ( orderId ) => {
	return new Promise( ( resolve ) => {
		wpcom.undocumented().getTitanControlPanelAutoLoginURL( orderId, ( serverError, result ) => {
			resolve( {
				error: serverError?.message,
				loginURL: serverError ? null : result.auto_login_url,
				expiryTimestamp: serverError ? null : result.expiry_timestamp,
			} );
		} );
	} );
};

export const fetchTitanIframeURL = ( orderId ) => {
	return new Promise( ( resolve ) => {
		wpcom.undocumented().getTitanControlPanelIframeURL( orderId, ( serverError, result ) => {
			resolve( {
				error: serverError?.message,
				iframeURL: serverError ? null : result.iframe_url,
				expiryTimestamp: serverError ? null : result.expiry_timestamp,
			} );
		} );
	} );
};
