import Smooch from 'smooch';
import { ZendeskConversation } from '../../types';

const AGE_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 3 days

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
			conversation.messages.every(
				( message ) =>
					message.type !== 'form' &&
					message.metadata?.type !== 'csat' &&
					message.metadata?.type !== 'form' &&
					! message.metadata?.rated &&
					Date.now() - conversation.lastUpdatedAt * 1000 < AGE_THRESHOLD
			)
		);

		return latestOpenConversation?.metadata.supportInteractionId;
	} catch {
		return null;
	}
}
