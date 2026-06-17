import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	CANCEL_IMAGE_GENERATION_TOOL_NAME,
	STOP_DICTATION_TOOL_NAME,
	executeCancelImageGenerationTool,
	executeStopDictationTool,
} from '../tools/dictation-control-tool';
import {
	FORMAT_TEXT_TOOL_NAME,
	GET_BLOCK_TOOL_NAME,
	GET_BLOCK_TYPE_TOOL_NAME,
	GET_BLOCK_TYPES_TOOL_NAME,
	GET_EDITOR_BLOCKS_TOOL_NAME,
	GET_INSERTER_ITEMS_TOOL_NAME,
	GET_SELECTED_BLOCK_TOOL_NAME,
	HAS_SELECTED_BLOCK_TOOL_NAME,
	INSERT_BLOCK_TOOL_NAME,
	INSERT_BLOCKS_TOOL_NAME,
	MOVE_BLOCK_TOOL_NAME,
	REMOVE_ALL_BLOCKS_TOOL_NAME,
	REMOVE_BLOCK_TOOL_NAME,
	REPLACE_BLOCK_TOOL_NAME,
	SELECT_BLOCK_TOOL_NAME,
	UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME,
	executeFormatTextTool,
	executeGetBlockTool,
	executeGetBlockTypeTool,
	executeGetBlockTypesTool,
	executeGetEditorBlocksTool,
	executeGetInserterItemsTool,
	executeGetSelectedBlockTool,
	executeHasSelectedBlockTool,
	executeInsertBlockTool,
	executeInsertBlocksTool,
	executeMoveBlockTool,
	executeRemoveAllBlocksTool,
	executeRemoveBlockTool,
	executeReplaceBlockTool,
	executeSelectBlockTool,
	executeUpdateBlockAttributesTool,
} from '../tools/editor-blocks-tool';
import {
	GET_POST_INFO_TOOL_NAME,
	PUBLISH_POST_TOOL_NAME,
	REDO_TOOL_NAME,
	SAVE_POST_TOOL_NAME,
	SET_POST_TITLE_TOOL_NAME,
	UNDO_TOOL_NAME,
	executeGetPostInfoTool,
	executePublishPostTool,
	executeRedoTool,
	executeSavePostTool,
	executeSetPostTitleTool,
	executeUndoTool,
} from '../tools/editor-post-tool';
import { GENERATE_IMAGE_TOOL_NAME, executeGenerateImageTool } from '../tools/generate-image-tool';
import { PICK_IMAGE_TOOL_NAME, executePickImageTool } from '../tools/image-picker-tool';
import {
	VERIFY_YOUTUBE_URL_TOOL_NAME,
	executeVerifyYoutubeUrlTool,
} from '../tools/youtube-oembed-tool';
import { getToolCallResultOk, getToolErrorMessage } from './errors';
import { describeToolCall } from './tool-labels';
import type { RealtimeToolEvent } from './types';

interface ExecuteRealtimeToolCallsArgs {
	event: { response?: { output?: unknown[] } };
	onToolEvent: ( event: RealtimeToolEvent ) => void;
	/**
	 * Drop any running entry with this id. Used when a tool call resolves into a
	 * "no log entry needed" state (e.g. user-cancelled image generation) and we'd
	 * otherwise leave the "Generating image…" indicator up forever.
	 */
	onToolEventRemove: ( id: string ) => void;
	sendFunctionCallOutput: ( callId: string, result: unknown ) => void;
	/**
	 * Aborted when the realtime session tears down. Long-running tools
	 * (generate_image_tool, ~30–60s) forward this to their HTTP requests so
	 * abandoned generations stop instead of finishing into a torn-down editor.
	 */
	signal?: AbortSignal;
}

interface ExecuteRealtimeToolCallsResult {
	didSendOutput: boolean;
	shouldStopDictation: boolean;
}

interface RealtimeFunctionCall {
	type: string;
	name?: string;
	call_id?: string;
	arguments?: unknown;
}

export async function executeRealtimeToolCalls( {
	event,
	onToolEvent,
	onToolEventRemove,
	sendFunctionCallOutput,
	signal,
}: ExecuteRealtimeToolCallsArgs ): Promise< ExecuteRealtimeToolCallsResult > {
	const functionCalls = getFunctionCalls( event );

	if ( ! functionCalls.length ) {
		return { didSendOutput: false, shouldStopDictation: false };
	}

	let didSendOutput = false;
	let shouldStopDictation = false;
	for ( const call of functionCalls ) {
		if ( ! call.call_id ) {
			continue;
		}

		let result: unknown;
		recordTracksEvent( 'calypso_smart_dictation_tool_called', {
			tool_name: call.name || 'unknown',
		} );
		if ( call.name === GENERATE_IMAGE_TOOL_NAME ) {
			onToolEvent( {
				id: call.call_id,
				label: 'Generating image…',
				status: 'running',
				timestamp: Date.now(),
			} );
		}
		try {
			result = await executeRealtimeToolCall( call, signal );
		} catch ( err ) {
			result = {
				ok: false,
				error: err instanceof Error ? err.message : 'Tool call failed',
			};
		}

		if ( ! getToolCallResultOk( result ) ) {
			recordTracksEvent( 'calypso_smart_dictation_tool_call_failed', {
				tool_name: call.name || 'unknown',
				error: getToolErrorMessage( result ) || 'Tool call failed',
			} );
		}

		const label = describeToolCall( call.name, call.arguments, result );
		if ( label ) {
			onToolEvent( {
				id: call.call_id ?? `${ Date.now() }-${ Math.random().toString( 36 ).slice( 2, 7 ) }`,
				label,
				status: getToolCallResultOk( result ) ? 'done' : 'error',
				timestamp: Date.now(),
			} );
		} else if ( call.call_id ) {
			// No final label means the entry should disappear (e.g. cancelled
			// image generation). Drop any running placeholder we put up earlier.
			onToolEventRemove( call.call_id );
		}

		sendFunctionCallOutput( call.call_id, result );
		didSendOutput = true;
		shouldStopDictation = shouldStopDictation || call.name === STOP_DICTATION_TOOL_NAME;
	}

	return { didSendOutput, shouldStopDictation };
}

function getFunctionCalls( event: { response?: { output?: unknown[] } } ): RealtimeFunctionCall[] {
	const outputs = Array.isArray( event.response?.output ) ? event.response?.output : [];
	return outputs.filter(
		( item ): item is RealtimeFunctionCall =>
			!! item && typeof item === 'object' && ( item as { type?: string } ).type === 'function_call'
	);
}

async function executeRealtimeToolCall(
	call: RealtimeFunctionCall,
	signal?: AbortSignal
): Promise< unknown > {
	if ( call.name === GET_EDITOR_BLOCKS_TOOL_NAME ) {
		return executeGetEditorBlocksTool( call.arguments );
	}
	if ( call.name === GET_SELECTED_BLOCK_TOOL_NAME ) {
		return executeGetSelectedBlockTool();
	}
	if ( call.name === GET_INSERTER_ITEMS_TOOL_NAME ) {
		return executeGetInserterItemsTool( call.arguments );
	}
	if ( call.name === HAS_SELECTED_BLOCK_TOOL_NAME ) {
		return executeHasSelectedBlockTool();
	}
	if ( call.name === SELECT_BLOCK_TOOL_NAME ) {
		return executeSelectBlockTool( call.arguments );
	}
	if ( call.name === GET_BLOCK_TYPES_TOOL_NAME ) {
		return executeGetBlockTypesTool( call.arguments );
	}
	if ( call.name === GET_BLOCK_TYPE_TOOL_NAME ) {
		return executeGetBlockTypeTool( call.arguments );
	}
	if ( call.name === INSERT_BLOCK_TOOL_NAME ) {
		return executeInsertBlockTool( call.arguments );
	}
	if ( call.name === INSERT_BLOCKS_TOOL_NAME ) {
		return executeInsertBlocksTool( call.arguments );
	}
	if ( call.name === UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME ) {
		return executeUpdateBlockAttributesTool( call.arguments );
	}
	if ( call.name === REPLACE_BLOCK_TOOL_NAME ) {
		return executeReplaceBlockTool( call.arguments );
	}
	if ( call.name === REMOVE_BLOCK_TOOL_NAME ) {
		return executeRemoveBlockTool( call.arguments );
	}
	if ( call.name === REMOVE_ALL_BLOCKS_TOOL_NAME ) {
		return executeRemoveAllBlocksTool();
	}
	if ( call.name === MOVE_BLOCK_TOOL_NAME ) {
		return executeMoveBlockTool( call.arguments );
	}
	if ( call.name === GET_BLOCK_TOOL_NAME ) {
		return executeGetBlockTool( call.arguments );
	}
	if ( call.name === FORMAT_TEXT_TOOL_NAME ) {
		return executeFormatTextTool( call.arguments );
	}
	if ( call.name === SET_POST_TITLE_TOOL_NAME ) {
		return executeSetPostTitleTool( call.arguments );
	}
	if ( call.name === SAVE_POST_TOOL_NAME ) {
		return executeSavePostTool( call.arguments );
	}
	if ( call.name === PUBLISH_POST_TOOL_NAME ) {
		return executePublishPostTool();
	}
	if ( call.name === UNDO_TOOL_NAME ) {
		return executeUndoTool();
	}
	if ( call.name === REDO_TOOL_NAME ) {
		return executeRedoTool();
	}
	if ( call.name === GET_POST_INFO_TOOL_NAME ) {
		return executeGetPostInfoTool();
	}
	if ( call.name === VERIFY_YOUTUBE_URL_TOOL_NAME ) {
		return executeVerifyYoutubeUrlTool( call.arguments );
	}
	if ( call.name === PICK_IMAGE_TOOL_NAME ) {
		return executePickImageTool( call.arguments );
	}
	if ( call.name === STOP_DICTATION_TOOL_NAME ) {
		return executeStopDictationTool();
	}
	if ( call.name === CANCEL_IMAGE_GENERATION_TOOL_NAME ) {
		return executeCancelImageGenerationTool();
	}
	if ( call.name === GENERATE_IMAGE_TOOL_NAME ) {
		return executeGenerateImageTool( call.arguments, signal );
	}
	return { ok: false, error: `Unsupported tool: ${ call.name || 'unknown' }` };
}
