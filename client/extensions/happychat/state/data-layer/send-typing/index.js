/**
 * External dependencies
 */
import {
	isEmpty,
	throttle,
} from 'lodash';

const doSendTyping = throttle( ( connection, message ) => {
	connection.typing( message );
}, 1000, { leading: true, trailing: false } );

const sendTyping = ( connection ) => ( store, { message } ) => {
	if ( isEmpty( message ) ) {
		connection.notTyping();
	} else {
		doSendTyping( connection, message );
	}
};

export default sendTyping;
