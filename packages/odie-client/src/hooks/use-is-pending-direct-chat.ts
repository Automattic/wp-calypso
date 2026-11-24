import { useSearchParams } from 'react-router-dom';
import { useOdieAssistantContext } from '../context';

/**
 * Whether a chat that goes straight to a person (`/odie?provider=zendesk`) hasn't reached the person
 * yet. The chat is still the AI's until then, so anything that introduces the AI would greet someone
 * who never asked for it.
 *
 * It covers both waits: for the chat client, while the route still has `provider=zendesk`, and for
 * the Zendesk conversation, which swaps that for `direct-zd-chat`. The second ends with the
 * transfer: if it fails, the user is back with the AI.
 */
export function useIsPendingDirectChat(): boolean {
	const { chat, isUserEligibleForPaidSupport, humanSupportRouting } = useOdieAssistantContext();
	const [ searchParams ] = useSearchParams();

	if ( chat.provider?.startsWith( 'zendesk' ) || chat.conversationId ) {
		return false;
	}

	const isWaitingToStart =
		searchParams.get( 'provider' ) === 'zendesk' &&
		( isUserEligibleForPaidSupport || !! humanSupportRouting );
	const isCreatingConversation = searchParams.has( 'direct-zd-chat' ) && chat.status === 'transfer';

	return isWaitingToStart || isCreatingConversation;
}
