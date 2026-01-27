import { useShouldUseUnifiedAgent } from '@automattic/agents-manager';
import AsyncLoad from 'calypso/components/async-load';

interface MasterbarHelpIconWrapperProps {
	siteId: number | null;
	tooltip: string;
}

/**
 * Wrapper component that decides which help icon to render based on the unified agent flag.
 * Uses the API-based check (useShouldUseUnifiedAgent) instead of Redux preferences
 * to ensure consistency with AgentsManagerLoader.
 */
export default function MasterbarHelpIconWrapper( {
	siteId,
	tooltip,
}: MasterbarHelpIconWrapperProps ) {
	const useUnifiedAgent = useShouldUseUnifiedAgent();

	if ( useUnifiedAgent ) {
		return (
			<AsyncLoad
				require="./masterbar-agents-manager"
				siteId={ siteId }
				tooltip={ tooltip }
				placeholder={ null }
			/>
		);
	}

	return (
		<AsyncLoad
			require="./masterbar-help-center"
			siteId={ siteId }
			tooltip={ tooltip }
			placeholder={ null }
		/>
	);
}
