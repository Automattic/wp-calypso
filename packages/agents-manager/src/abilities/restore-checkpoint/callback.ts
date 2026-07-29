import { __ } from '@wordpress/i18n';
import {
	RESTORE_CHECKPOINT_TOOL_ID,
	clearCheckpoint,
	getCheckpoints,
	hasCheckpoint,
	restoreCheckpoint,
	setCheckpoint,
} from '../../utils/checkpoints';
import { isEditorPage } from '../../utils/is-editor-page';
import { getToolCallIdFromConversationHistory } from '../../utils/tool-call-history';
import type { AbilityResult } from '../types';

export interface RestoreCheckpointInput {
	checkpointId: string;
	summary: string;
	requestIntentType?: 'undo' | 'redo' | 'restore';
}

// A restore's reciprocal checkpoint steps back over the restore itself, so an
// undo's reciprocal serves redo requests and vice versa.
function getReciprocalRequestIntentType(
	requestIntentType: RestoreCheckpointInput[ 'requestIntentType' ]
): RestoreCheckpointInput[ 'requestIntentType' ] {
	if ( requestIntentType === 'undo' ) {
		return 'redo';
	}
	if ( requestIntentType === 'redo' ) {
		return 'undo';
	}
	return requestIntentType;
}

function errorResult(
	message: string,
	error: string,
	details?: Record< string, unknown >
): AbilityResult {
	return {
		result: { success: false, message, error, ...( details && { details } ) },
		returnToAgent: true,
	};
}

/**
 * The `restore-checkpoint` ability callback.
 */
export async function restoreCheckpointCallback(
	input: RestoreCheckpointInput
): Promise< AbilityResult > {
	const { checkpointId, summary, requestIntentType = 'restore' } = input;

	if ( ! isEditorPage() ) {
		return errorResult(
			__( 'I can only restore checkpoints from the editor.', __i18n_text_domain__ ),
			'Not an editor page.'
		);
	}

	if ( ! checkpointId ) {
		return errorResult(
			__(
				'I could not restore the checkpoint because no checkpoint ID was provided.',
				__i18n_text_domain__
			),
			'Missing checkpointId.'
		);
	}

	if ( ! hasCheckpoint( checkpointId ) ) {
		return errorResult(
			__( 'I could not find a checkpoint for that ID.', __i18n_text_domain__ ),
			`Checkpoint not found: ${ checkpointId }`,
			{ checkpointId }
		);
	}

	const targetCheckpoint = getCheckpoints().find( ( { id } ) => id === checkpointId );
	const restoreToolCallId = getToolCallIdFromConversationHistory( RESTORE_CHECKPOINT_TOOL_ID );
	const reciprocalRequestIntentType = getReciprocalRequestIntentType( requestIntentType );

	const reciprocalId =
		restoreToolCallId && ! hasCheckpoint( restoreToolCallId ) ? restoreToolCallId : null;

	// Record the pre-restore state under this call's own id, so an explicit
	// redo can step back over this restore.
	if ( reciprocalId ) {
		setCheckpoint( reciprocalId, targetCheckpoint?.checkpointKeys ?? [], {
			toolCallId: reciprocalId,
			toolId: RESTORE_CHECKPOINT_TOOL_ID,
			summary,
			restoresCheckpointId: checkpointId,
			restoredCheckpointToolId: targetCheckpoint?.toolId,
			requestIntentType: reciprocalRequestIntentType,
			createdByRequestIntentType: requestIntentType,
		} );
	}

	try {
		await restoreCheckpoint( checkpointId );
	} catch ( error ) {
		// A failed restore leaves the editor unchanged — drop the reciprocal
		// so it does not advertise a redo for a restore that never happened.
		if ( reciprocalId ) {
			clearCheckpoint( reciprocalId );
		}
		return errorResult(
			__(
				'I did not restore that checkpoint because it may replace or remove too much current content.',
				__i18n_text_domain__
			),
			error instanceof Error ? error.message : String( error ),
			{ checkpointId }
		);
	}

	// Only the newest reciprocal stays valid — a stale one would redo over
	// newer changes.
	if ( restoreToolCallId ) {
		getCheckpoints()
			.filter(
				( checkpoint ) =>
					checkpoint.toolId === RESTORE_CHECKPOINT_TOOL_ID &&
					checkpoint.id !== restoreToolCallId &&
					( checkpoint.requestIntentType === reciprocalRequestIntentType ||
						! checkpoint.requestIntentType )
			)
			.forEach( ( { id } ) => clearCheckpoint( id ) );
	}

	return {
		result: { success: true, message: summary, details: { checkpointId } },
		returnToAgent: true,
	};
}
