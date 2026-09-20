import { __ } from '@wordpress/i18n';
import { repointShortId, resolveClientId } from '../../utils/block-ids';
import { getBlockingMove } from '../../utils/canvas-binding';
import { captureCanvas } from '../../utils/canvas-capture';
import { checkpointKeys, sealCheckpointForSwap, withCheckpoint } from '../../utils/checkpoints';
import { deepClone } from '../../utils/deep-clone';
import { getPageBlocks, openUndoLevel } from '../../utils/editor-blocks';
import {
	getCustomCss,
	getEditedGlobalStyles,
	setCustomCss,
	waitForEditedGlobalStyles,
} from '../../utils/global-styles';
import { isEditorPage } from '../../utils/is-editor-page';
import { isRecord } from '../../utils/is-record';
import { getToolCallIdFromConversationHistory } from '../../utils/tool-call-history';
import {
	APPLY_BLOCK_EDITS_TOOL_ID,
	type ApplyBlockEditsOutcome,
} from '../../utils/tool-message-utils';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import { errorResult } from '../ability-result';
import { areUpdateEditsAlreadySatisfied } from './already-applied';
import { applyEdits, type ApplyEditsOptions } from './apply-edits';
import { getChangeType, getEditedMenuIds } from './change-type';
import { hasRequestedBlockEdits, normalizeEdits, type RawBlockEdits } from './normalize-edits';
import {
	captureTargets,
	getEditedClientIds,
	getValidationDetails,
	haveBlocksChanged,
} from './validation-details';
import type { BlockEdits, ChangeType } from './types';
import type { AbilityResult } from '../types';

interface ApplyBlockEditsInput extends RawBlockEdits {
	followUpTasks?: unknown;
	toolCallId?: unknown;
	/** Ids the caller resolves itself, ahead of the page structure's. */
	reverseMap?: unknown;
	/** Set by the server when it may hold its ack back for a look at the capture. */
	visualCheckPending?: unknown;
}

interface ApplyBlockEditsResultData {
	success: boolean;
	message: string;
	error?: string;
	details?: Record< string, unknown >;
	outcome?: ApplyBlockEditsOutcome;
	changeType?: ChangeType;
}

type ApplyBlockEditsResult = AbilityResult & { result: ApplyBlockEditsResultData };

const GLOBAL_STYLES_UNAVAILABLE_ERROR =
	'Custom CSS could not be updated because global styles are unavailable.';

/**
 * The tool-result message the chat renders this apply from. `visualCheckPending`
 * is omitted rather than sent false, so a payload with no check pending keeps
 * exactly its previous shape.
 */
const createAgentMessage = (
	toolCallId: string,
	result: ApplyBlockEditsResultData,
	followUpTasks: boolean,
	visualCheckPending: boolean
): string =>
	JSON.stringify( {
		tool_id: APPLY_BLOCK_EDITS_TOOL_ID,
		tool_call_id: toolCallId,
		data: { result, followUpTasks, ...( visualCheckPending && { visualCheckPending: true } ) },
	} );

type Resolver = Omit< ApplyEditsOptions, 'level' >;

// A caller's own map is read first, as the WebMCP adapter's; the rest are the
// page structure's. A replaced block keeps its id for the rest of the call.
function createResolver( reverseMap: unknown ): Resolver {
	const supplied = isRecord( reverseMap ) ? reverseMap : {};
	const replaced = new Map< string, string >();

	return {
		resolve: ( id ) => {
			const supplied_ = supplied[ id ];
			const resolved = typeof supplied_ === 'string' ? supplied_ : resolveClientId( id );

			return replaced.get( id ) ?? replaced.get( resolved ) ?? resolved;
		},
		onReplaced: ( requestedId, clientId ) => {
			replaced.set( requestedId, clientId );
			repointShortId( requestedId, clientId );
		},
	};
}

const noChangesResult = ( summary: string | undefined ): ApplyBlockEditsResultData => ( {
	success: true,
	message: summary ?? __( 'The requested changes were already applied.', __i18n_text_domain__ ),
	outcome: 'no-changes',
} );

const nothingChangedResult = (): ApplyBlockEditsResultData => ( {
	success: false,
	message: __(
		"I was not able to make the changes you requested. Either I don't have the capability to do so or I didn't understand your request. You can ask me to try again or ask me to do something else.",
		__i18n_text_domain__
	),
	error: 'No block or CSS changes were detected after applying edits.',
} );

function failedResult( error: unknown ): ApplyBlockEditsResultData {
	// eslint-disable-next-line no-console
	console.error( '[AgentsManager] Error applying block edits:', error );

	return {
		success: false,
		message: __( 'Something went wrong. Please try again.', __i18n_text_domain__ ),
		error: error instanceof Error ? error.message : String( error ),
	};
}

async function applyEditsAction(
	edits: BlockEdits,
	{ toolCallId, summary, resolve, onReplaced }: Resolver & { toolCallId?: string; summary?: string }
): Promise< { result: ApplyBlockEditsResultData; insertedClientIds: string[] } > {
	const hasBlockEdits = hasRequestedBlockEdits( edits );
	const hasCustomCss = edits.customCSS !== undefined;

	// The post editor does not load the record at boot; reading it starts the
	// fetch, so wait for it rather than fail the first request.
	const globalStyles = hasCustomCss ? await waitForEditedGlobalStyles() : undefined;

	if ( hasCustomCss && ! globalStyles ) {
		throw new Error( GLOBAL_STYLES_UNAVAILABLE_ERROR );
	}

	// The CSS to write: the one sent, unless the site already holds it.
	const customCss =
		globalStyles && edits.customCSS !== getCustomCss( globalStyles.record )
			? edits.customCSS
			: undefined;

	// Nothing to write: no checkpoint, so no undo that does nothing.
	if (
		customCss === undefined &&
		( ! hasBlockEdits || areUpdateEditsAlreadySatisfied( edits, resolve ) )
	) {
		return { result: noChangesResult( summary ), insertedClientIds: [] };
	}

	// A saved menu's items live in its record, which the blocks snapshot cannot
	// hold and the page's blocks do not show: the menu is captured as well.
	const menuIds = getEditedMenuIds( edits, resolve );
	const hasNavigationEdit = menuIds.length > 0;
	// A menu edit cannot be swapped inline: its checkpoint holds more than blocks.
	const changeType = hasNavigationEdit ? 'other' : getChangeType( edits );
	const capturedTargets = captureTargets( edits, resolve );
	const successMessage = summary ?? __( 'I have completed the edits.', __i18n_text_domain__ );
	const keys = [
		...( hasBlockEdits ? [ checkpointKeys.BLOCKS ] : [] ),
		...( customCss !== undefined ? [ checkpointKeys.CUSTOM_CSS ] : [] ),
		...( hasNavigationEdit ? [ checkpointKeys.NAVIGATION ] : [] ),
	];
	let insertedClientIds: string[] = [];

	const result = await withCheckpoint(
		{ toolId: APPLY_BLOCK_EDITS_TOOL_ID, toolCallId, keys, summary: successMessage },
		async ( recorder ): Promise< ApplyBlockEditsResultData > => {
			// Change detection compares against the page as it was here, not the
			// checkpoint: a repeat of the call keeps the first run's snapshot.
			const before = deepClone( getPageBlocks() );
			const level = openUndoLevel();
			// The blocks written land as one native undo level, and the checkpoint
			// keeps its blocks domain only when they changed.
			const closeBlockWrites = (): boolean => {
				const written = level.hasWritten();

				level.close();

				// After a move the page on screen is another one, so it says nothing.
				const blocksChanged =
					written && ( !! getBlockingMove() || haveBlocksChanged( before, getPageBlocks() ) );

				if ( blocksChanged ) {
					recorder.markWritten( checkpointKeys.BLOCKS );
				}

				return blocksChanged;
			};

			let recoveredTargetIds: Set< string >;

			try {
				for ( const menuId of menuIds ) {
					await recorder.captureMenu( menuId );
				}

				( { recoveredTargetIds, insertedClientIds } = await applyEdits( edits, {
					resolve,
					onReplaced,
					level,
				} ) );

				if ( customCss !== undefined ) {
					const currentGlobalStyles = getEditedGlobalStyles();

					if ( ! currentGlobalStyles ) {
						throw new Error( GLOBAL_STYLES_UNAVAILABLE_ERROR );
					}

					setCustomCss( currentGlobalStyles, customCss );
					recorder.markWritten( checkpointKeys.CUSTOM_CSS );
				}
			} catch ( error ) {
				// Returned rather than thrown: the writes that landed are in place,
				// and the checkpoint is the only way back past them.
				closeBlockWrites();

				return failedResult( error );
			}

			const blocksChanged = closeBlockWrites();

			if ( customCss === undefined && ! hasNavigationEdit && ! blocksChanged ) {
				return nothingChangedResult();
			}

			return {
				success: true,
				message: successMessage,
				outcome: 'updated',
				changeType,
				details: getValidationDetails( {
					edits,
					resolve,
					before,
					after: getPageBlocks(),
					capturedTargets,
					recoveredTargetIds,
				} ),
			};
		}
	);

	// A text edit alone gets the chat's inline Undo / Redo.
	if ( toolCallId && result.outcome === 'updated' && changeType === 'text-content' ) {
		sealCheckpointForSwap( toolCallId );
	}

	return { result, insertedClientIds };
}

const countRequested = ( list: unknown ): number => ( Array.isArray( list ) ? list.length : 0 );

/**
 * Applies the edits under a checkpoint and attaches a capture of the canvas.
 * Every path returns a result: a failure after the edits began keeps the
 * checkpoint, since the writes that landed stay in place. One Tracks event per
 * call past the editor guard, joined to a later undo by the tool call id.
 */
export async function applyBlockEditsCallback(
	rawInput: unknown
): Promise< ApplyBlockEditsResult > {
	if ( ! isEditorPage() ) {
		return errorResult(
			'Block edits can only be applied from the editor.',
			__( 'I can only edit blocks from the editor.', __i18n_text_domain__ )
		);
	}

	// The wire hands the arguments over as they are; an invalid shape fails below.
	const input: ApplyBlockEditsInput = isRecord( rawInput ) ? rawInput : {};
	const suppliedToolCallId =
		typeof input.toolCallId === 'string' && input.toolCallId ? input.toolCallId : undefined;
	const toolCallId =
		suppliedToolCallId ??
		getToolCallIdFromConversationHistory( APPLY_BLOCK_EDITS_TOOL_ID ) ??
		undefined;
	const summary =
		typeof input.summary === 'string' && input.summary.trim() ? input.summary.trim() : undefined;
	const resolver = createResolver( input.reverseMap );

	let edits: BlockEdits | undefined;
	let result: ApplyBlockEditsResultData;
	let insertedClientIds: string[] = [];

	try {
		edits = normalizeEdits( input );
		( { result, insertedClientIds } = await applyEditsAction( edits, {
			toolCallId,
			summary,
			...resolver,
		} ) );
	} catch ( error ) {
		result = failedResult( error );
	}

	// Counted as normalized where the request was valid; as sent where not.
	const requested = edits ?? input;

	recordBigSkyTracksEvent( 'jetpack_big_sky_block_edits_applied', {
		outcome: result.success ? result.outcome : 'failed',
		...( toolCallId && { tool_call_id: toolCallId } ),
		requested_update_count: countRequested( requested.updates ),
		requested_insert_count: countRequested( requested.inserts ),
		requested_delete_count: countRequested( requested.deletes ),
	} );

	// Captured after every path, the no-change and failure ones most of all:
	// there the block tree cannot say whether the user's problem is fixed. A
	// CSS-only call gets the whole page; a call stopped by a move gets none.
	const fileParts = getBlockingMove()
		? null
		: await captureCanvas( {
				clientIds: [
					...( edits ? getEditedClientIds( edits, resolver.resolve ) : [] ),
					...insertedClientIds,
				],
				fullPage: !! edits && edits.customCSS !== undefined && ! hasRequestedBlockEdits( edits ),
			} );

	// `visualCheckPending` ships only with an image: the chat withholds the
	// summary on the strength of it, and with nothing to look at the server's
	// reply would never come.
	const visualCheckPending = input.visualCheckPending === true && !! fileParts;
	const followUpTasks = input.followUpTasks === true;

	return {
		result,
		returnToAgent: true,
		// Rendered by the chat, so only a call the chat made carries one; the
		// history's id stands in for the checkpoint alone.
		...( suppliedToolCallId && {
			agentMessage: createAgentMessage(
				suppliedToolCallId,
				result,
				followUpTasks,
				visualCheckPending
			),
		} ),
		...( fileParts && { __file_parts: fileParts } ),
	};
}
