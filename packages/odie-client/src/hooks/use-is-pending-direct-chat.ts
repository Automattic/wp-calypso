import { useSearchParams } from 'react-router-dom';
import { useOdieAssistantContext } from '../context';

/**
 * Asks a chat that goes straight to a person to start with the user's first message rather than
 * when it opens, so opening the Help Center doesn't make an empty ticket.
 */
export const START_ON_MESSAGE_PARAM = 'start-on-message';

/**
 * Whether a chat that goes straight to a person and starts on the first message is waiting for
 * it. The wait begins once the chat client is ready, which swaps `provider=zendesk` for
 * `direct-zd-chat`, and ends when the user sends a message.
 */
export function useIsWaitingForFirstMessage(): boolean {
	const { chat, isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const [ searchParams ] = useSearchParams();

	return (
		! chat.provider?.startsWith( 'zendesk' ) &&
		! chat.conversationId &&
		chat.status !== 'transfer' &&
		searchParams.has( 'direct-zd-chat' ) &&
		searchParams.has( START_ON_MESSAGE_PARAM ) &&
		isUserEligibleForPaidSupport
	);
}

/**
 * Whether a chat that goes straight to a person (`/odie?provider=zendesk`) hasn't reached the person
 * yet. The chat is still the AI's until then, so anything that introduces the AI would greet someone
 * who never asked for it.
 *
 * It covers every wait: for the chat client, while the route still has `provider=zendesk`, for the
 * user's first message when the chat starts on it, and for the Zendesk conversation, which swaps
 * `provider` for `direct-zd-chat`. The last ends with the transfer: if it fails, the user is back
 * with the AI.
 */
export function useIsPendingDirectChat(): boolean {
	const { chat, isUserEligibleForPaidSupport, humanSupportRouting } = useOdieAssistantContext();
	const [ searchParams ] = useSearchParams();
	const isWaitingForFirstMessage = useIsWaitingForFirstMessage();

	if ( chat.provider?.startsWith( 'zendesk' ) || chat.conversationId ) {
		return false;
	}

	const isWaitingToStart =
		searchParams.get( 'provider' ) === 'zendesk' &&
		( isUserEligibleForPaidSupport || !! humanSupportRouting );
	const isCreatingConversation = searchParams.has( 'direct-zd-chat' ) && chat.status === 'transfer';

	return isWaitingToStart || isWaitingForFirstMessage || isCreatingConversation;
}
