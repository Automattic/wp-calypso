import wpcom from 'lib/wp';
import { failConnectionsRequest, receiveConnections } from 'state/sharing/publicize/actions';

import {
	PUBLICIZE_CONNECTIONS_REQUEST
} from 'state/action-types';

export const requestPublicizeConnections = ( { dispatch } ) => ( { siteId } ) => (
	wpcom
		.undocumented()
		.siteConnections( siteId, ( error, data ) => {
			if ( ! error ) {
				return dispatch( receiveConnections( siteId, data ) );

			}

			dispatch( failConnectionsRequest( siteId, error ) );
		} )
);

export default [ PUBLICIZE_CONNECTIONS_REQUEST, requestPublicizeConnections ];
