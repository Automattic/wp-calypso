/** @format */

/**
 * Internal Dependencies
 */
import userUtils from 'lib/user/utils';

export function handleAccountClosed( handler ) {
	return ( params, fn ) =>
		handler( params, ( err, response = {} ) => {
			const { code, message } = response;
			if ( +code === 400 && message === 'The user account has been closed...' ) {
				userUtils.logout();
			}
			return fn( err, response );
		} );
}

export function injectAccountClosedHandler( wpcom ) {
	const request = wpcom.request.bind( wpcom );
	return {
		...wpcom,
		request: handleAccountClosed( request ),
	};
}
