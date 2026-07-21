import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { setCheckpoint } from '../../utils/checkpoint';
import { BIG_SKY_SHOW_COMPONENT_TOOL_ID } from '../../utils/show-component-tools';
import type { AbilityResult } from '../types';
import type { ShowComponentType } from './constants';

export interface ShowComponentInput {
	type: ShowComponentType;
	props: Record< string, unknown >;
	summary?: string;
	followUpTasks?: boolean;
	/** Injected by the agenttic client — not part of the model-facing schema. */
	messageId?: string;
	/** Injected by the agenttic client — not part of the model-facing schema. */
	toolCallId?: string;
}

/**
 * The `show-component` ability callback.
 * Returns a JSON `agentMessage` for `convertToolMessagesToComponents()`.
 */
export async function showComponentCallback( input: ShowComponentInput ): Promise< AbilityResult > {
	const { type, props = {}, summary, followUpTasks, messageId, toolCallId } = input;

	try {
		if ( typeof props !== 'object' || Object.keys( props ).length === 0 ) {
			throw new Error( '[AgentsManager] Props must be an object with properties' );
		}

		// Set checkpoint so the action can be undone.
		const checkpointId = toolCallId || messageId;
		if ( checkpointId ) {
			setCheckpoint( checkpointId );
		}

		// Read at call time so the picker records the page it was shown on.
		const currentPostId = (
			select( 'core/editor' ) as { getCurrentPostId?: () => number } | undefined
		 )?.getCurrentPostId?.();

		const successMessage =
			summary?.trim() || __( 'Choose from the options I provided.', __i18n_text_domain__ );

		return {
			result: {
				success: true,
				message: successMessage,
				details: { type },
			},
			// The picker renders from the structured `agentMessage`, while the
			// tool result tells the agent the picker was shown.
			returnToAgent: true,
			agentMessage: JSON.stringify( {
				tool_id: BIG_SKY_SHOW_COMPONENT_TOOL_ID,
				data: {
					type,
					props,
					followUpTasks,
					summary: successMessage,
					isCurrent: true,
					postId: currentPostId,
					calypsoCheckpointId: checkpointId,
				},
			} ),
		};
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `[AgentsManager] Error showing component ${ type }:`, error );

		return {
			result: {
				success: false,
				message: __(
					'There was an error with this request. Please try again.',
					__i18n_text_domain__
				),
				error: error instanceof Error ? error.message : String( error ),
			},
			returnToAgent: true,
		};
	}
}
