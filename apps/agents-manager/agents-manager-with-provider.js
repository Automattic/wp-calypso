import UnifiedAIAgent from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AgentsManagerWithProvider( { sectionName } ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<UnifiedAIAgent sectionName={ sectionName } />
		</QueryClientProvider>
	);
}
