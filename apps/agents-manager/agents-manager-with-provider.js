/* global agentsManagerData */
import AgentsManager from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AgentsManagerWithProvider() {
	return (
		<QueryClientProvider client={ queryClient }>
			<AgentsManager
				sectionName={ agentsManagerData.sectionName || 'wp-admin' }
				currentUser={ agentsManagerData.currentUser }
				site={ agentsManagerData.site }
			/>
		</QueryClientProvider>
	);
}
