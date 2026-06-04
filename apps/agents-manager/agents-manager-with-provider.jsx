/* global agentsManagerData */
import './config';
import AgentsManager, { useShouldCoexistAiSurfaces } from '@automattic/agents-manager';
import { AiSurfaceCoordinator } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

/**
 * Inner component rendered inside QueryClientProvider so that
 * useShouldCoexistAiSurfaces (which calls useQuery) has the required context.
 */
function AgentsManagerInner( { useImageUpload } ) {
	AiSurfaceCoordinator.useAiSurfaceCoordinator( useShouldCoexistAiSurfaces() );

	return (
		<AgentsManager
			sectionName={ agentsManagerData.sectionName || 'wp-admin' }
			currentUser={ agentsManagerData.currentUser }
			site={ agentsManagerData.site }
			currentSiteId={ agentsManagerData.site?.ID }
			useImageUpload={ useImageUpload }
		/>
	);
}

export default function AgentsManagerWithProvider( { useImageUpload } ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<AgentsManagerInner useImageUpload={ useImageUpload } />
		</QueryClientProvider>
	);
}
