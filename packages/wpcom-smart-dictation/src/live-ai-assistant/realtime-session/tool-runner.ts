import { recordTracksEvent } from '@automattic/calypso-analytics';
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
	sendFunctionCallOutput: ( callId: string, result: unknown ) => void;
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
	sendFunctionCallOutput,
}: ExecuteRealtimeToolCallsArgs ): Promise< boolean > {
	const functionCalls = getFunctionCalls( event );

	if ( ! functionCalls.length ) {
		return false;
	}

	let didSendOutput = false;
	for ( const call of functionCalls ) {
		if ( ! call.call_id ) {
			continue;
		}

		let result: unknown;
		recordTracksEvent( 'calypso_smart_dictation_tool_called', {
			tool_name: call.name || 'unknown',
		} );
		try {
			result = await executeRealtimeToolCall( call );
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
		}

		sendFunctionCallOutput( call.call_id, result );
		didSendOutput = true;
	}

	return didSendOutput;
}

function getFunctionCalls( event: { response?: { output?: unknown[] } } ): RealtimeFunctionCall[] {
	const outputs = Array.isArray( event.response?.output ) ? event.response?.output : [];
	return outputs.filter(
		( item ): item is RealtimeFunctionCall =>
			!! item && typeof item === 'object' && ( item as { type?: string } ).type === 'function_call'
	);
}

async function executeRealtimeToolCall( call: RealtimeFunctionCall ): Promise< unknown > {
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
	return { ok: false, error: `Unsupported tool: ${ call.name || 'unknown' }` };
}
