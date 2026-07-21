import { __ } from '@wordpress/i18n';
import { zoomOut } from '../../utils/canvas-zoom';
import type { UseCheckpointReturn } from '../../hooks/use-checkpoint';
import type { AbilityResult, ShowComponentType } from '../types';

export interface ShowComponentInput {
	type: ShowComponentType;
	props: Record< string, unknown >;
	summary?: string;
	followUpTasks?: boolean;
	zoomOut?: boolean;
	/** Injected by the agenttic client — not part of the model-facing schema. */
	messageId?: string;
	/** Injected by the agenttic client — not part of the model-facing schema. */
	toolCallId?: string;
}

export type ShowComponentCallback = ( input: ShowComponentInput ) => Promise< AbilityResult >;

/**
 * Dependencies provided by the host (e.g., `orchestrator-chat`).
 */
export interface ShowComponentDeps {
	/** The current post ID from the editor. */
	currentPostId?: number;
	/** Checkpoint utilities for undo support. */
	checkpoint: Pick< UseCheckpointReturn, 'setCheckpoint' >;
	/** Whether a site is currently being built. Blocks double-click during zoom-out. */
	isBuildingSite?: boolean;
}

/**
 * Creates the `show-component` ability callback.
 * Returns a JSON `agentMessage` for `convertToolMessagesToComponents()`.
 */
export function createCallback( deps: ShowComponentDeps ): ShowComponentCallback {
	return async ( input: ShowComponentInput ): Promise< AbilityResult > => {
		const {
			type,
			props = {},
			summary,
			followUpTasks,
			zoomOut: shouldZoomOut = false,
			messageId,
			toolCallId,
		} = input;

		try {
			if ( typeof props !== 'object' || Object.keys( props ).length === 0 ) {
				throw new Error( '[AgentsManager] Props must be an object with properties' );
			}

			// Color and font pickers skip auto-zoom because they are lightweight
			// style pickers and zooming disrupts the editing context.
			if ( shouldZoomOut && type !== 'color-picker' && type !== 'font-picker' ) {
				zoomOut( { blockDoubleClick: deps.isBuildingSite } );
			}

			// Set checkpoint so the action can be undone.
			const checkpointId = toolCallId || messageId;
			if ( checkpointId ) {
				deps.checkpoint.setCheckpoint( checkpointId );
			}

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
					// Uses `big_sky__` prefix to match `convertToolMessagesToComponents()`.
					tool_id: 'big_sky__show_component',
					data: {
						type,
						props,
						followUpTasks,
						summary: successMessage,
						isCurrent: true,
						postId: deps.currentPostId,
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
	};
}
