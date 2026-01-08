/* global helpCenterData */
import AgentsManager from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AgentsManagerWithProvider() {
	return (
		<QueryClientProvider client={ queryClient }>
			<AgentsManager
				sectionName={ helpCenterData.sectionName || 'wp-admin' }
				currentUser={ helpCenterData.currentUser }
				site={ helpCenterData.site }
			/>
		</QueryClientProvider>
	);
}
