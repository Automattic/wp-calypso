/**
 * Help Center AI Assistant Component
 *
 * Conditionally renders either the new unified agent (CalypsoAIAgent)
 * or the legacy HelpCenterGPT based on feature flag.
 */

import { CalypsoAIAgent } from '@automattic/ai-agents';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseUnifiedAgent } from '../hooks';
import { HelpCenterGPT } from './help-center-gpt';
import type { JetpackSearchAIResult } from '../data/use-jetpack-search-ai';
import type { SearchResult } from '../types';

interface HelpCenterAIAssistantProps {
	onResponseReceived: ( response: JetpackSearchAIResult ) => void;
	redirectToArticle: (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
		result: SearchResult
	) => void;
}

export function HelpCenterAIAssistant( {
	onResponseReceived,
	redirectToArticle,
}: HelpCenterAIAssistantProps ) {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const { currentUser, site, sectionName } = useHelpCenterContext();

	// Use unified agent if feature flag is enabled
	if ( shouldUseUnifiedAgent ) {
		return (
			<CalypsoAIAgent
				containerSelector=".help-center"
				currentUser={ currentUser }
				site={ site }
				sectionName={ sectionName }
			/>
		);
	}

	// Fall back to legacy HelpCenterGPT
	return (
		<HelpCenterGPT
			onResponseReceived={ onResponseReceived }
			redirectToArticle={ redirectToArticle }
		/>
	);
}
