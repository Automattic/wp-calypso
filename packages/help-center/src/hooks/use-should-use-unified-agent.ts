/* eslint-disable no-restricted-imports */
import { useUnifiedAiChat } from '../data/use-unified-ai-chat';

export const useShouldUseUnifiedAgent = () => {
	const { data: isEligibleViaAPI } = useUnifiedAiChat();

	return isEligibleViaAPI;
};
