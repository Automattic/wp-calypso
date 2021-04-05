/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export const fetchTitanAutoLoginURL = ( emailAccountId, context ) => {
	return new Promise( ( resolve ) => {
		wpcom
			.undocumented()
			.getTitanControlPanelAutoLoginURL( emailAccountId, context, ( serverError, result ) => {
				resolve( {
					error: serverError?.message,
					loginURL: serverError ? null : result.auto_login_url,
				} );
			} );
	} );
};

export const fetchTitanIframeURL = ( emailAccountId, context ) => {
	return new Promise( ( resolve ) => {
		wpcom
			.undocumented()
			.getTitanControlPanelIframeURL( emailAccountId, context, ( serverError, result ) => {
				resolve( {
					error: serverError?.message,
					iframeURL: serverError ? null : result.iframe_url,
				} );
			} );
	} );
};

export const checkTitanEmailAddressAvailability = ( emailAddress ) => {
	return new Promise( ( resolve ) => {
		wpcom
			.undocumented()
			.getTitanEmailAddressAvailability( emailAddress, ( serverError, result ) => {
				resolve( {
					error: serverError?.message,
					available: serverError ? false : result.message === 'OK',
				} );
			} );
	} );
};
