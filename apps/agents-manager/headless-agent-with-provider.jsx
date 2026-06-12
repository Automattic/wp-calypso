/* global helpCenterData */
import { HeadlessAgentInitializer } from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function HeadlessAgentWithProvider() {
	// eslint-disable-next-line no-console
	console.log( '[AgentsManager] Initializing agent in headless mode (no UI)' );

	return (
		<QueryClientProvider client={ queryClient }>
			<HeadlessAgentInitializer
				site={ helpCenterData?.site }
				currentRoute={ window.location.pathname }
			/>
		</QueryClientProvider>
	);
}
