
/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'state/action-types';

import { connection } from './common';

import { receiveChatTranscript } from './actions';
import { getHappychatTranscriptTimestamp } from './selectors';

const debug = require( 'debug' )( 'calypso:happychat:actions' );

export const requestTranscript = ( { getState, dispatch } ) => {
	const timestamp = getHappychatTranscriptTimestamp( getState() );
	debug( 'requesting transcript', timestamp );
	connection.transcript( timestamp ).then(
		result => dispatch( receiveChatTranscript( result.messages, result.timestamp ) ),
		e => debug( 'failed to get transcript', e )
	);
};

export default ( store ) => {
	return next => action => {
		switch ( action.type ) {
			case HAPPYCHAT_TRANSCRIPT_REQUEST:
				requestTranscript( store );
				break;
		}
		return next( action );
	};
};
