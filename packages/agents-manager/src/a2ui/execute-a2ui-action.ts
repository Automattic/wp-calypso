import type { AgentConfig } from '../utils/create-agent-config';
import type { A2uiClientAction } from '@a2ui/web_core/v0_9';
import type { UseAgentChatReturn } from '@automattic/agenttic-client';

export async function executeA2uiAction(
	action: A2uiClientAction,
	config: AgentConfig,
	onSubmit: UseAgentChatReturn[ 'onSubmit' ]
) {
	const provider = config.contextProvider;
	const getClientContext = provider?.getClientContext;
	const getActionContext = () => {
		// Only the action's first request is hidden; tool continuations use normal context.
		if ( provider && getClientContext ) {
			provider.getClientContext = getClientContext;
		}
		const context = getClientContext?.call( provider ) ?? {};
		return {
			...context,
			flags: {
				...( typeof context.flags === 'object' && context.flags !== null ? context.flags : {} ),
				context_only: true,
			},
		};
	};
	if ( provider ) {
		provider.getClientContext = getActionContext;
	}
	try {
		await onSubmit( JSON.stringify( { version: 'v0.9', action } ), {
			type: 'context',
			sessionId: config.sessionId,
		} );
	} finally {
		if ( provider && getClientContext && provider.getClientContext === getActionContext ) {
			provider.getClientContext = getClientContext;
		}
	}
}
