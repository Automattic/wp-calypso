/* eslint-disable no-restricted-imports */

import { useSupportStatus } from '../data/use-support-status';
import { useGetHistoryChats } from './use-get-history-chats';
import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL() {
	const { data: supportStatus, isLoading } = useSupportStatus();
	const { recentConversations } = useGetHistoryChats();

	const supportInteractionId = recentConversations[ 0 ]?.metadata?.supportInteractionId;

	const shouldUseWapuu = useShouldUseWapuu();
	const isEligibleForSupport = Boolean( supportStatus?.eligibility?.is_user_eligible );

	if ( isEligibleForSupport || shouldUseWapuu ) {
		const url = shouldUseWapuu ? `/odie/${ supportInteractionId }` : '/contact-options';
		return { url, isLoading: false };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
