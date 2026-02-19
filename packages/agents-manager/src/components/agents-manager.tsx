import UnifiedAIAgent from './unified-ai-agent';
import type { UnifiedAIAgentProps } from './unified-ai-agent';

export type AgentsManagerProps = UnifiedAIAgentProps;

export default function AgentsManager( props: AgentsManagerProps ) {
	return <UnifiedAIAgent { ...props } />;
}
