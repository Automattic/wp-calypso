import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { checkpointKeys, setCheckpoint } from '../../utils/checkpoints';
import { BIG_SKY_SHOW_COMPONENT_TOOL_ID } from '../../utils/show-component-tools';
import { getToolCallIdFromConversationHistory } from '../../utils/tool-call-history';
import type { AbilityResult } from '../types';
import type { ShowComponentType } from './index';

const CHECKPOINT_KEYS_BY_TYPE: Record< ShowComponentType, string[] > = {
	'button-picker': [ checkpointKeys.BUTTON ],
	'font-picker': [ checkpointKeys.FONT ],
	'color-picker': [ checkpointKeys.COLOR ],
};

export interface ShowComponentInput {
	type: ShowComponentType;
	props: Record< string, unknown >;
	summary?: string;
	followUpTasks?: boolean;
}

function errorResult( error: string ): AbilityResult {
	return {
		result: {
			success: false,
			message: __(
				'There was an error with this request. Please try again.',
				__i18n_text_domain__
			),
			error,
		},
		returnToAgent: true,
	};
}

/**
 * The `show-component` ability callback.
 * Returns a JSON `agentMessage` for `convertToolMessagesToComponents()`.
 */
export async function showComponentCallback( input: ShowComponentInput ): Promise< AbilityResult > {
	const { type, props, summary, followUpTasks } = input;

	if ( ! props || typeof props !== 'object' || Object.keys( props ).length === 0 ) {
		// eslint-disable-next-line no-console
		console.error( `[AgentsManager] Invalid props for component ${ type }` );

		return errorResult( 'Props must be an object with properties' );
	}

	try {
		// Read at call time so the picker records the page it was shown on.
		const currentPostId = (
			select( 'core/editor' ) as { getCurrentPostId?: () => number } | undefined
		 )?.getCurrentPostId?.();

		const successMessage =
			( typeof summary === 'string' && summary.trim() ) ||
			__( 'Choose from the options I provided.', __i18n_text_domain__ );

		// Snapshot the pre-pick state under this call's id, scoped to the picker's
		// style domain — the checkpoint `restore-checkpoint` can undo picks with.
		// Unknown types get no checkpoint; the schema enum is advisory only.
		const checkpointKeysForType = CHECKPOINT_KEYS_BY_TYPE[ type ];
		const toolCallId = checkpointKeysForType
			? getToolCallIdFromConversationHistory( BIG_SKY_SHOW_COMPONENT_TOOL_ID )
			: null;
		if ( toolCallId ) {
			setCheckpoint( toolCallId, checkpointKeysForType, {
				toolId: BIG_SKY_SHOW_COMPONENT_TOOL_ID,
				summary: successMessage,
			} );
		}

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
				},
			} ),
		};
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `[AgentsManager] Error showing component ${ type }:`, error );

		return errorResult( error instanceof Error ? error.message : String( error ) );
	}
}
