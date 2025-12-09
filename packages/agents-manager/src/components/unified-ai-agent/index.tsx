import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AgentDock from '../agent-dock';
import { PersistentRouter } from '../persistent-router';
import type { HelpCenterSite, CurrentUser } from '@automattic/data-stores';

export interface UnifiedAIAgentProps {
	/** The current route path. */
	currentRoute?: string;
	/** Indicates if the user is eligible for chat. */
	isEligibleForChat: boolean;
	/** The name of the current section (e.g., 'posts', 'pages'). */
	sectionName: string;
	/** The selected site object. */
	site?: HelpCenterSite | null;
	/** The current user object. */
	currentUser?: CurrentUser;
	/** Called when the agent is closed. */
	handleClose?: () => void;
}

const queryClient = new QueryClient();

export default function UnifiedAIAgent( props: UnifiedAIAgentProps ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<PersistentRouter>
				<AgentSetup { ...props } />
			</PersistentRouter>
		</QueryClientProvider>
	);
}

// Separate component that uses hooks within `PersistentRouter` context
function AgentSetup( {
	currentRoute,
	site = null,
	sectionName,
	isEligibleForChat,
}: UnifiedAIAgentProps ) {
	return (
		<AgentDock
			site={ site }
			currentRoute={ currentRoute }
			isEligibleForChat={ isEligibleForChat }
			sectionName={ sectionName }
		/>
	);
}
