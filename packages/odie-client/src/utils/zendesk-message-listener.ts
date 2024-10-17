import Smooch from 'smooch';
import type { ZendeskMessage } from '../types/';

export const zendeskMessageListener = (
	odieChatId: number | undefined | null,
	callback: ( message: ZendeskMessage ) => void
) => {
	// Smooch types are not up to date
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Smooch.on( 'message:received', ( message: any, data ) => {
		const zendeskMessage = message as ZendeskMessage;
		if ( odieChatId && zendeskMessage.metadata[ 'odieChatId' ] === odieChatId ) {
			callback( zendeskMessage );
			Smooch.markAllAsRead( data.conversation.id );
		}
	} );
};
