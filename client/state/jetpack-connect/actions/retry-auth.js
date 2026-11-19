import debugFactory from 'debug';
import { getRetryAuthUrl } from 'calypso/jetpack-connect/utils';
import { navigate } from 'calypso/lib/navigate';
import { urlToSlug } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { JETPACK_CONNECT_RETRY_AUTH } from 'calypso/state/jetpack-connect/action-types';

import 'calypso/state/jetpack-connect/init';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:jetpack-connect:actions' );

/**
 * Sends the user to the site to re-issue the authorize secret.
 * @param {string} url Site URL.
 * @param {number} attemptNumber Retry attempt.
 * @param {Object} [retryArgs] `from`, `redirectAfterAuth` and `skipPricing`, see `getRetryAuthUrl()`.
 * @returns {Function} Action thunk.
 */
export function retryAuth( url, attemptNumber, retryArgs ) {
	return ( dispatch ) => {
		debug( 'retrying auth', url, attemptNumber );
		dispatch( {
			type: JETPACK_CONNECT_RETRY_AUTH,
			attemptNumber: attemptNumber,
			slug: urlToSlug( url ),
		} );
		dispatch(
			recordTracksEvent( 'calypso_jpc_retry_auth', {
				url: url,
				attempt: attemptNumber,
			} )
		);
		debug( 'retryAuth', url );
		navigate( getRetryAuthUrl( url, retryArgs ) );
	};
}
