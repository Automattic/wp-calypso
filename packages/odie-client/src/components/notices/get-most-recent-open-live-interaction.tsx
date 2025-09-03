import Smooch from 'smooch';
import { ZendeskConversation } from '../../types';

/**
 * Queries the Smooch SDK and gets the latest open conversation. Try to call as late as possible and don't cache the result.
 * @returns The support interaction ID of the latest open conversation.
 */
export default function getMostRecentOpenLiveInteraction() {
	try {
		const conversations: ZendeskConversation[] = ( Smooch?.getConversations?.() ??
			[] ) as unknown as ZendeskConversation[];

		// They're already sorted by lastUpdatedAt, so we can just find the first one that's open.
		const latestOpenConversation = conversations.find( ( conversation ) =>
			// having a csat message means the conversation is closed
			conversation.messages.every( ( message ) => message.metadata?.type !== 'csat' )
		);

		return latestOpenConversation?.metadata.supportInteractionId;
	} catch {
		return null;
	}
}
