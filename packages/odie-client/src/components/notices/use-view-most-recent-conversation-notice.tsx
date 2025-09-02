import { useGetSupportInteractionById } from '../../data';
import { useGetMostRecentOpenConversation } from '../../hooks/use-get-most-recent-open-conversation';

export default function useViewMostRecentOpenConversationNotice() {
	const { mostRecentSupportInteractionId, totalNumberOfConversations } =
		useGetMostRecentOpenConversation();

	const fetchSupportInteraction =
		mostRecentSupportInteractionId?.toString() && totalNumberOfConversations === 1
			? mostRecentSupportInteractionId.toString()
			: null;
	const { data: supportInteraction } = useGetSupportInteractionById( fetchSupportInteraction );
	const shouldDisplayNotice = supportInteraction || totalNumberOfConversations > 1;

	return shouldDisplayNotice;
}
