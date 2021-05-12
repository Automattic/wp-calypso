/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';
import {
	HAPPYCHAT_ELIGIBILITY_SET,
	PRESALE_PRECANCELLATION_CHAT_AVAILABILITY_SET,
} from 'calypso/state/action-types';
import { errorNotice } from 'calypso/state/notices/actions';
import { setSupportLevel } from 'calypso/state/help/actions';
import { logToLogstash } from 'calypso/state/logstash/actions';

import 'calypso/state/happychat/init';

export const setHappyChatEligibility = ( isEligible ) => ( {
	type: HAPPYCHAT_ELIGIBILITY_SET,
	isEligible,
} );

export const setPresalePrecancellationAvailability = ( availability ) => ( {
	type: PRESALE_PRECANCELLATION_CHAT_AVAILABILITY_SET,
	availability,
} );

export const requestHappychatEligibility = () => ( dispatch ) => {
	const clientSlug = config( 'client_slug' );
	wpcom
		.undocumented()
		.getOlarkConfiguration( clientSlug )
		.then( ( configuration ) => {
			dispatch( setHappyChatEligibility( configuration.isUserEligible ) );
			dispatch( setPresalePrecancellationAvailability( configuration.availability ) );
			dispatch( setSupportLevel( configuration.supportLevel ) );
		} )
		.catch( ( error ) => {
			// Hides notices for authorization errors as they should be legitimate (e.g. we use this error code to check
			// whether the user is logged in when fetching the user profile)
			if ( error && error.message && error.error !== 'authorization_required' ) {
				dispatch( errorNotice( error.message ) );
				// Log this failure to logstash. This is debug info for https://github.com/Automattic/wp-calypso/issues/51517
				// and can probably be removed once that's closed.
				dispatch(
					logToLogstash( {
						feature: 'calypso_client',
						message: 'Olark configuration request failed',
						severity: 'error',
						extra: {
							error: error.name,
							status: error.status,
							message: error.message,
						},
					} )
				);
			}
		} );
};
