/**
 * External dependencies
 */
import debugFactory from 'debug';

import {
	receiveChatTranscript,
} from 'extensions/happychat/state/actions';

const debug = debugFactory( 'calypso:extensions:happychat:state:data-layer:transcript-request' );

const transcriptRequest = ( connection ) => ( { dispatch } ) => {
	debug( 'requesting current session transcript' );

	// passing a null timestamp will request the latest session's transcript
	return connection.transcript( null ).then(
		result => dispatch( receiveChatTranscript( result.messages, result.timestamp ) ),
		e => debug( 'failed to get transcript', e )
	);
};

export default transcriptRequest;
