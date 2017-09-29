/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:extensions:happychat:state:data-layer:send-message' );

const sendMessage = ( connection ) => ( store, { message } ) => {
	debug( 'sending message', message );
	connection.send( message );
	connection.notTyping();
};

export default sendMessage;
