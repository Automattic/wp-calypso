/* global helpCenterData */
import AgentsManager from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AgentsManagerWithProvider() {
	// `helpCenterData` is injected by PHP and may be undefined in some wp-admin contexts.
	if ( typeof helpCenterData === 'undefined' ) {
		return null;
	}

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
