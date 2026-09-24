import { __ } from '@wordpress/i18n';
import {
	RESTORE_CHECKPOINT_TOOL_ID,
	clearCheckpoint,
	getCheckpoint,
	getCheckpoints,
	hasCheckpoint,
	restoreCheckpoint,
	setReciprocalCheckpoint,
} from '../../utils/checkpoints';
import { isEditorPage } from '../../utils/is-editor-page';
import { isRecord } from '../../utils/is-record';
import { getToolCallIdFromConversationHistory } from '../../utils/tool-call-history';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import { errorResult, successResult } from '../ability-result';
import type { CheckpointMetadata } from '../../utils/checkpoints';
import type { AbilityResult } from '../types';

export interface RestoreCheckpointInput {
	checkpointId: string;
	summary: string;
	requestIntentType?: CheckpointMetadata[ 'requestIntentType' ];
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

function restoreFailedResult( error: unknown, checkpointId: string ): AbilityResult {
	// eslint-disable-next-line no-console
	console.error( `[AgentsManager] Error restoring checkpoint ${ checkpointId }:`, error );

	return errorResult(
		`${
			error instanceof Error ? error.message : String( error )
		} Some of the checkpoint may already have been restored, so check the current state before trying again.`,
		__( 'I could not fully restore that checkpoint.', __i18n_text_domain__ ),
		{ checkpointId }
	);
}

// Only the newest reciprocal stays valid — a stale one would redo over newer
// changes.
function clearStaleReciprocals(
	restoreToolCallId: string,
	reciprocalRequestIntentType: RestoreCheckpointInput[ 'requestIntentType' ]
): void {
	const isStaleReciprocal = ( checkpoint: {
		id: string;
		toolId?: string;
		requestIntentType?: string;
	} ) =>
		checkpoint.toolId === RESTORE_CHECKPOINT_TOOL_ID &&
		checkpoint.id !== restoreToolCallId &&
		( checkpoint.requestIntentType === reciprocalRequestIntentType ||
			! checkpoint.requestIntentType );

	getCheckpoints()
		.filter( isStaleReciprocal )
		.forEach( ( { id } ) => clearCheckpoint( id ) );
}

async function restore( input: RestoreCheckpointInput ): Promise< AbilityResult > {
	const { checkpointId, summary, requestIntentType = 'restore' } = input;

	if ( ! isEditorPage() ) {
		return errorResult(
			'Not an editor page.',
			__( 'I can only restore checkpoints from the editor.', __i18n_text_domain__ )
		);
	}

	if ( ! checkpointId ) {
		return errorResult(
			'Missing checkpointId.',
			__(
				'I could not restore the checkpoint because no checkpoint ID was provided.',
				__i18n_text_domain__
			)
		);
	}

	const targetCheckpoint = getCheckpoint( checkpointId );
	if ( ! targetCheckpoint ) {
		return errorResult(
			`Checkpoint not found: ${ checkpointId }`,
			__( 'I could not find a checkpoint for that ID.', __i18n_text_domain__ ),
			{ checkpointId }
		);
	}

	const restoreToolCallId = getToolCallIdFromConversationHistory( RESTORE_CHECKPOINT_TOOL_ID );
	const reciprocalRequestIntentType = getReciprocalRequestIntentType( requestIntentType );

	const reciprocalId =
		restoreToolCallId && ! hasCheckpoint( restoreToolCallId ) ? restoreToolCallId : null;

	// Record the pre-restore state under this call's own id, so an explicit
	// redo can step back over this restore.
	if ( reciprocalId ) {
		try {
			await setReciprocalCheckpoint( reciprocalId, targetCheckpoint, {
				toolId: RESTORE_CHECKPOINT_TOOL_ID,
				summary,
				restoresCheckpointId: checkpointId,
				restoredCheckpointToolId: targetCheckpoint.toolId,
				requestIntentType: reciprocalRequestIntentType,
				createdByRequestIntentType: requestIntentType,
			} );
		} catch ( error ) {
			// Refused rather than restored without a way back: the same unreadable
			// page or menu would fail the restore part-way, leaving the site
			// half-restored with no redo.
			return errorResult(
				`Could not record a way back before restoring: ${
					error instanceof Error ? error.message : String( error )
				} Nothing was restored.`,
				__( 'I could not restore that checkpoint.', __i18n_text_domain__ ),
				{ checkpointId }
			);
		}
	}

	try {
		await restoreCheckpoint( checkpointId );
	} catch ( error ) {
		// The reciprocal is kept: domains restore in sequence and several persist,
		// so a failure part-way leaves the site changed with this as the only way
		// back. Where nothing was restored, redoing to the current state is free.
		return restoreFailedResult( error, checkpointId );
	}

	if ( restoreToolCallId ) {
		clearStaleReciprocals( restoreToolCallId, reciprocalRequestIntentType );
	}

	return successResult( summary, { checkpointId } );
}

/**
 * Records every attempt, refused and failed ones too. The chat's Undo button
 * records the same event without a `source`, and the id is the tool call the
 * checkpoint is keyed by, which joins an undo to the edit it undid.
 */
export async function restoreCheckpointCallback( rawInput: unknown ): Promise< AbilityResult > {
	const input = isRecord( rawInput ) ? rawInput : {};
	const checkpointId = typeof input.checkpointId === 'string' ? input.checkpointId : '';
	const requestIntentType =
		input.requestIntentType === 'undo' || input.requestIntentType === 'redo'
			? input.requestIntentType
			: 'restore';

	const result = await restore( {
		checkpointId,
		summary: typeof input.summary === 'string' ? input.summary : '',
		requestIntentType,
	} );

	recordBigSkyTracksEvent( 'jetpack_big_sky_restore_checkpoint_action', {
		action: requestIntentType,
		id: checkpointId,
		outcome: result.result.success ? 'success' : 'failed',
		source: 'chat',
	} );

	return result;
}
