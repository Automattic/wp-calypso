import { useSmooch } from '@automattic/zendesk-client';
import { useOdieAssistantContext } from './context';
import { getConversationMetadada, getConversationUserFields } from './utils/conversation-utils';

export const useNewHumanConversation = () => {
	const { chat, selectedSiteId, selectedSiteUrl, sectionName } = useOdieAssistantContext();
	const { createConversation } = useSmooch();

	const newConversation = async () => {
		if ( ! chat.chat_id ) {
			return;
		}
		await createConversation(
			getConversationUserFields( chat.chat_id, selectedSiteUrl, sectionName, selectedSiteId ),
			getConversationMetadada( chat.chat_id )
		);
	};

	return { newConversation };
};
