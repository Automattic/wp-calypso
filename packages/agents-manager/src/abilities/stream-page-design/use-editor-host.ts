import { useRegistry } from '@wordpress/data';
import { useMemo, useRef } from '@wordpress/element';
import { blockCurrentRequest, getBlockingMove } from '../../utils/canvas-binding';
import {
	checkpointKeys,
	clearCheckpoint,
	hasCheckpoint,
	setCheckpoint,
} from '../../utils/checkpoints';
import { deepClone } from '../../utils/deep-clone';
import {
	clearBlockSelection,
	getRootBlocks,
	replaceRootBlocks,
	resolveBlocksRoot,
	stageRootBlocks,
	type EditorBlock,
} from '../../utils/editor-blocks';
import { commitStreamedPageDesign } from './commit';
import { STREAM_PAGE_DESIGN_TOOL_ID } from './stream';
import type { EditorHost } from './renderer';

/**
 * The renderer's host for the editor: frames are staged outside the undo
 * stack, the page is checkpointed before the first frame so the agent can put
 * it back, and the finished design commits as one native undo level.
 */
export function useEditorHost(): EditorHost {
	const registry = useRegistry();
	// The page as it was, per tool call, for the native undo level. Spent on commit.
	const blocksBefore = useRef< Map< string, EditorBlock[] > >( new Map() );

	return useMemo( () => {
		const stage = ( rootClientId: string, blocks: EditorBlock[] ) =>
			stageRootBlocks( rootClientId, blocks, registry.batch );

		return {
			// The stream paints before its guarded callback runs, so it keeps to the
			// bound canvas itself: after a move nothing is staged, and the block is
			// latched so the callback refuses the same way.
			resolveRoot: () => {
				if ( getBlockingMove() ) {
					blockCurrentRequest();
					return null;
				}

				return resolveBlocksRoot()?.clientId ?? null;
			},

			stageBlocks: stage,

			captureCheckpoint: ( toolCallId, rootClientId ) => {
				// Once per tool call: `setCheckpoint()` replaces, and a snapshot taken
				// after the first frame would hold the design, not the page.
				if ( hasCheckpoint( toolCallId ) ) {
					return;
				}

				// Model-facing, like the rest of the checkpoint context.
				setCheckpoint( toolCallId, [ checkpointKeys.BLOCKS ], {
					toolId: STREAM_PAGE_DESIGN_TOOL_ID,
					summary: 'Page design',
				} );
				blocksBefore.current.set( toolCallId, deepClone( getRootBlocks( rootClientId ) ) );
			},

			commitFinalDesign: ( toolCallId, rootClientId ) => {
				const before = blocksBefore.current.get( toolCallId );

				if ( ! before ) {
					return;
				}

				blocksBefore.current.delete( toolCallId );

				const changed = commitStreamedPageDesign(
					{
						getLiveBlocks: () => getRootBlocks( rootClientId ),
						stageBlocks: ( blocks ) => stage( rootClientId, blocks ),
						replaceBlocks: ( blocks ) => replaceRootBlocks( rootClientId, blocks ),
						clearSelection: clearBlockSelection,
					},
					before
				);

				// A stream that left the page as it was has nothing to undo.
				if ( ! changed ) {
					clearCheckpoint( toolCallId );
				}
			},
		};
	}, [ registry ] );
}
