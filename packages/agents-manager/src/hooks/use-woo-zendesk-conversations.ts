import { useGetZendeskConversations } from '@automattic/zendesk-client';
import { useAgentsManagerContext } from '../contexts';
import { isWooAiProvider } from '../utils/is-woo-ai-provider';

/**
 * Loads Zendesk conversations only for the Woo AI surface, which owns the dedicated integration.
 */
export default function useWooZendeskConversations( enabled = true ) {
	const { site, zendeskSmoochIntegrationKey } = useAgentsManagerContext();

	return useGetZendeskConversations(
		enabled && isWooAiProvider(),
		zendeskSmoochIntegrationKey,
		site?.ID
	);
}
