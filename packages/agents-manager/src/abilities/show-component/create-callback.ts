import { zoomOut } from '../../utils/canvas-zoom';
import type { UseCheckpointReturn } from '../../hooks/use-checkpoint';
import type { AbilityResult, ShowComponentType } from '../types';

export interface ShowComponentInput {
	type: ShowComponentType;
	props: Record< string, unknown >;
	followUpTasks?: boolean;
	zoomOut?: boolean;
	clientId?: string;
	insertIndex?: number;
	messageId?: string;
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
			followUpTasks,
			zoomOut: shouldZoomOut = false,
			clientId,
			messageId,
			insertIndex,
		} = input;

		// Shallow copy to avoid mutating the caller's object.
		const props = { ...inputProps };

		try {
			if ( typeof props !== 'object' || Object.keys( props ).length === 0 ) {
				throw new Error( '[AgentsManager] Props must be an object with properties' );
			}

			if ( shouldZoomOut ) {
				zoomOut( { blockDoubleClick: deps.isBuildingSite } );
			}

			// Resolve compressed `clientId` and attach `insertIndex` if provided.
			const resolvedClientId = clientId ? deps.getClientIdMap()[ clientId ] : undefined;
			if ( resolvedClientId ) {
				props.clientId = resolvedClientId;
			}
			if ( insertIndex !== undefined ) {
				props.insertIndex = insertIndex;
			}

			// Set checkpoint so the action can be undone.
			if ( messageId ) {
				const isNewPage = type === 'pattern-picker' && !! props?.newPageId;
				const checkpointKey = isNewPage ? 'page' : CHECKPOINT_KEYS[ type ];

				deps.checkpoint.setCheckpoint( messageId, [ checkpointKey ] );

				if ( isNewPage ) {
					deps.checkpoint.addNewPageToCheckpoint( props.newPageId as string );
				}
			}

			return {
				result: 'Component displayed successfully',
				returnToAgent: false,
				agentMessage: JSON.stringify( {
					// Uses `big_sky__` prefix to match `convertToolMessagesToComponents()`.
					tool_id: 'big_sky__show_component',
					data: {
						type,
						props,
						followUpTasks,
						isCurrent: true,
						postId: deps.currentPostId,
						calypsoCheckpointId: messageId,
					},
				} ),
			};
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( `[AgentsManager] Error showing component ${ type }:`, error );

			return {
				result: 'There was an error with this request.',
				returnToAgent: !! followUpTasks,
			};
		}
	};
}
