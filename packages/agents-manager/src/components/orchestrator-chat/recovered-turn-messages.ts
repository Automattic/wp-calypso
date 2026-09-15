import RetryFailedMessage from '../retry-failed-message';
import type { OrphanedTurn } from '../../hooks/use-orphaned-turn-recovery';
import type { AgentsManagerUIMessage } from '../../utils/convert-tool-messages-to-components';

/**
 * Append each recovered turn as its own question bubble followed by its retry
 * affordance. Display-only: these belong to no session, so they trail whatever
 * the transcript already holds rather than being woven into it.
 * @param messages      The transcript so far.
 * @param failedRetries The turns recovery is still holding.
 * @param onRetry       Re-sends one turn.
 */
export default function insertRetryAffordances(
	messages: AgentsManagerUIMessage[],
	failedRetries: OrphanedTurn[],
	onRetry: ( turn: OrphanedTurn ) => void
): AgentsManagerUIMessage[] {
	if ( failedRetries.length === 0 ) {
		return messages;
	}

	const baseTimestamp = ( messages[ messages.length - 1 ]?.timestamp ?? Date.now() ) + 1;

	return [
		...messages,
		...failedRetries.flatMap( ( turn, index ): AgentsManagerUIMessage[] => [
			{
				id: `failed-turn-${ turn.id }`,
				role: 'user',
				content: [ { type: 'text', text: turn.text } ],
				timestamp: baseTimestamp + index * 2,
				archived: false,
				showIcon: true,
			},
			{
				id: `failed-retry-${ turn.id }`,
				role: 'agent',
				content: [
					{
						type: 'component',
						component: RetryFailedMessage as React.ComponentType,
						componentProps: { onRetry: () => onRetry( turn ) },
					},
				],
				timestamp: baseTimestamp + index * 2 + 1,
				archived: false,
				showIcon: false,
				suppressThinking: true,
			},
		] ),
	];
}
