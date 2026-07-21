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
	clientId?: string;
	insertIndex?: number;
	/** Injected by the agenttic client — not part of the model-facing schema. */
	messageId?: string;
	/** Injected by the agenttic client — not part of the model-facing schema. */
	toolCallId?: string;
}

export type ShowComponentCallback = ( input: ShowComponentInput ) => Promise< AbilityResult >;

const CHECKPOINT_KEYS: Record< ShowComponentType, string > = {
	'button-picker': 'button',
	'font-picker': 'font',
	'color-picker': 'color',
	'pattern-picker': 'blocks',
};

/**
 * Dependencies provided by the host (e.g., `orchestrator-chat`).
 */
export interface ShowComponentDeps {
	/** The current post ID from the editor. */
	currentPostId?: number;
	/** Get the map of compressed client IDs to real block client IDs. */
	getClientIdMap: () => Record< string, string >;
	/** Checkpoint utilities for undo support. */
	checkpoint: Pick< UseCheckpointReturn, 'setCheckpoint' | 'addNewPageToCheckpoint' >;
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
			props: inputProps = {},
			summary,
			followUpTasks,
			zoomOut: shouldZoomOut = false,
			clientId,
			messageId,
			toolCallId,
			insertIndex,
		} = input;

		// Shallow copy to avoid mutating the caller's object.
		const props = { ...inputProps };

		try {
			if ( typeof props !== 'object' || Object.keys( props ).length === 0 ) {
				throw new Error( '[AgentsManager] Props must be an object with properties' );
			}

			// Color and font pickers skip auto-zoom because they are lightweight
			// style pickers and zooming disrupts the editing context.
			if ( shouldZoomOut && type !== 'color-picker' && type !== 'font-picker' ) {
				zoomOut( { blockDoubleClick: deps.isBuildingSite } );
			}

			// Resolve compressed `clientId` and attach `insertIndex` if provided.
			const resolvedClientId = clientId ? deps.getClientIdMap()[ clientId ] : undefined;
			if ( resolvedClientId ) {
				props.clientId = resolvedClientId;
			}
			if ( insertIndex !== undefined && insertIndex >= 0 ) {
				props.insertIndex = insertIndex;
			}

			// Set checkpoint so the action can be undone.
			const checkpointId = toolCallId || messageId;
			if ( checkpointId ) {
				const isNewPage = type === 'pattern-picker' && !! props?.newPageId;
				const checkpointKey = isNewPage ? 'page' : CHECKPOINT_KEYS[ type ];

				deps.checkpoint.setCheckpoint( checkpointId, [ checkpointKey ] );

				if ( isNewPage ) {
					deps.checkpoint.addNewPageToCheckpoint( props.newPageId as string );
				}
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
