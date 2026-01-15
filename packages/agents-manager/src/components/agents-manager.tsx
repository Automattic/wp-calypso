import {
	HelpCenterRequiredContextProvider,
	type HelpCenterRequiredInformation,
	useHelpCenterContext,
} from '@automattic/help-center/src/contexts/HelpCenterContext';
import useChatStatus from '@automattic/help-center/src/hooks/use-chat-status';
import UnifiedAIAgent from './unified-ai-agent';

function AgentsManager() {
	const { currentUser, site, sectionName } = useHelpCenterContext();
	const { isEligibleForChat } = useChatStatus();

	return (
		<UnifiedAIAgent
			isEligibleForChat={ isEligibleForChat }
			currentUser={ currentUser }
			site={ site }
			sectionName={ sectionName }
		/>
	);
}

export default function ContextualizedAgentsManager(
	props: Pick< HelpCenterRequiredInformation, 'currentUser' | 'sectionName' | 'site' >
) {
	return (
		<HelpCenterRequiredContextProvider value={ props }>
			<AgentsManager />
		</HelpCenterRequiredContextProvider>
	);
}
