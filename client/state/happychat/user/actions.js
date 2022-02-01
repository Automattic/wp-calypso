import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { HAPPYCHAT_SET_USER_CONFIG } from 'calypso/state/action-types';
import { errorNotice } from 'calypso/state/notices/actions';

import 'calypso/state/happychat/init';

export const setHappychatUserConfig = ( config ) => ( {
	type: HAPPYCHAT_SET_USER_CONFIG,
	config,
} );

export const requestHappychatEligibility = () => ( dispatch ) => {
	wpcom.req
		.get( '/help/olark/mine' )
		.then( ( configuration ) => {
			dispatch( setHappychatUserConfig( configuration ) );
		} )
		.catch( ( error ) => {
			// Hides notices for authorization errors as they should be legitimate (e.g. we use this error code to check
			// whether the user is logged in when fetching the user profile)
			if ( error && error.message && error.error !== 'authorization_required' ) {
				dispatch( errorNotice( error.message ) );
				// Log this failure to logstash. This is debug info for https://github.com/Automattic/wp-calypso/issues/51517
				// and can probably be removed once that's closed.
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Olark configuration request failed',
					severity: 'error',
					extra: {
						error: error.name,
						status: error.status,
						message: error.message,
					},
				} );
			}
		} );
};
