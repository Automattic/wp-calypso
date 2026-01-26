import UnifiedAIAgent from './unified-ai-agent';
import type { AgentsManagerSite, CurrentUser } from '@automattic/data-stores';

export interface AgentsManagerProps {
	sectionName: string;
	currentUser?: CurrentUser;
	site?: AgentsManagerSite | null;
	isEligibleForChat: boolean;
}

/**
 * Standalone AgentsManager component.
 *
 * Unlike the Help Center integration, this component receives all required
 * data as props rather than through context. This allows it to work
 * independently of the Help Center plugin.
 */
export default function AgentsManager( {
	sectionName,
	currentUser,
	site,
	isEligibleForChat,
}: AgentsManagerProps ) {
	return (
		<UnifiedAIAgent
			isEligibleForChat={ isEligibleForChat }
			currentUser={ currentUser }
			site={ site }
			sectionName={ sectionName }
		/>
	);
}
