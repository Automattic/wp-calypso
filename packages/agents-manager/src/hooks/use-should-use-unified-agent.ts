/* eslint-disable no-restricted-imports */
import { useUnifiedAiChat } from './use-unified-ai-chat';

export const useShouldUseUnifiedAgent = () => {
	const { data: isEligibleViaAPI } = useUnifiedAiChat();

	return isEligibleViaAPI;
};
