/* global agentsManagerData */
import './config';
import AgentsManager from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Stable empty-array reference so the default prop doesn't change identity on
// every render and trigger needless downstream re-renders.
const EMPTY_ARRAY = [];

export default function AgentsManagerWithProvider( {
	zendeskConversationTags = EMPTY_ARRAY,
	zendeskSmoochIntegrationKey,
	zendeskTicketProductFieldValue,
} ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<AgentsManager
				sectionName={ agentsManagerData.sectionName || 'wp-admin' }
				currentUser={ agentsManagerData.currentUser }
				site={ agentsManagerData.site }
				currentSiteId={ agentsManagerData.site?.ID }
				zendeskConversationTags={ zendeskConversationTags }
				zendeskSmoochIntegrationKey={ zendeskSmoochIntegrationKey }
				zendeskTicketProductFieldValue={ zendeskTicketProductFieldValue }
			/>
		</QueryClientProvider>
	);
}
