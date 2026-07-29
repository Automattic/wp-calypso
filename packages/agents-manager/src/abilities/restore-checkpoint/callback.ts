import { __ } from '@wordpress/i18n';
import {
	RESTORE_CHECKPOINT_TOOL_ID,
	clearCheckpoint,
	getCheckpoint,
	getCheckpoints,
	hasCheckpoint,
	restoreCheckpoint,
	setCheckpoint,
} from '../../utils/checkpoints';
import { isEditorPage } from '../../utils/is-editor-page';
import { getProviderCheckpoint, getProviderCheckpoints } from '../../utils/provider-checkpoints';
import { getToolCallIdFromConversationHistory } from '../../utils/tool-call-history';
import type { CheckpointMetadata } from '../../utils/checkpoints';
import type { UseCheckpointReturn } from '../../utils/load-external-providers';
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

function restoredResult( summary: string, checkpointId: string ): AbilityResult {
	return {
		result: { success: true, message: summary, details: { checkpointId } },
		returnToAgent: true,
	};
}

function restoreFailedResult( error: unknown, checkpointId: string ): AbilityResult {
	return errorResult(
		__( 'I could not restore that checkpoint.', __i18n_text_domain__ ),
		error instanceof Error ? error.message : String( error ),
		{ checkpointId }
	);
}

// Restores a checkpoint Big Sky still holds — its tools write to its own store
// until they migrate. The reciprocal is recorded there too, scoped to the
// target's keys: a keyless record would redo through Big Sky's legacy
// full-snapshot path, which re-applies its (stale) variation titles over
// AM-applied styles. Unreadable or keyless targets get no reciprocal — no
// redo beats a wrong redo. The page-rename flip and navigation snapshots are
// copied like Big Sky's own tool does, so a redo re-applies them.
async function restoreProviderCheckpoint(
	providerCheckpoints: UseCheckpointReturn,
	{ checkpointId, summary, requestIntentType = 'restore' }: RestoreCheckpointInput
): Promise< AbilityResult > {
	const targetCheckpoint = getProviderCheckpoint( checkpointId );
	const restoreToolCallId = getToolCallIdFromConversationHistory( RESTORE_CHECKPOINT_TOOL_ID );
	const reciprocalId =
		targetCheckpoint &&
		restoreToolCallId &&
		! hasCheckpoint( restoreToolCallId ) &&
		! providerCheckpoints.hasCheckpoint( restoreToolCallId )
			? restoreToolCallId
			: null;

	if ( reciprocalId && targetCheckpoint ) {
		const { pageRename } = targetCheckpoint;
		// `toolCallId` matches Big Sky's own record shape in its store.
		providerCheckpoints.setCheckpoint( reciprocalId, targetCheckpoint.checkpointKeys, {
			toolCallId: reciprocalId,
			toolId: RESTORE_CHECKPOINT_TOOL_ID,
			summary,
			restoresCheckpointId: checkpointId,
			requestIntentType: getReciprocalRequestIntentType( requestIntentType ),
			createdByRequestIntentType: requestIntentType,
			...( pageRename && {
				pageRename: {
					pageId: pageRename.pageId,
					oldTitle: pageRename.newTitle,
					newTitle: pageRename.oldTitle,
				},
			} ),
		} );

		// Capture the navigation snapshots before the restore mutates them.
		Object.keys( targetCheckpoint.navigationRecords ?? {} ).forEach(
			( navigationId ) =>
				providerCheckpoints.addNavigationToCheckpoint?.( reciprocalId, navigationId )
		);
	}

	try {
		await providerCheckpoints.restoreCheckpoint( checkpointId );
	} catch ( error ) {
		if ( reciprocalId ) {
			providerCheckpoints.clearCheckpoint( reciprocalId );
		}
		return restoreFailedResult( error, checkpointId );
	}

	return restoredResult( summary, checkpointId );
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

	const targetCheckpoint = getCheckpoint( checkpointId );
	if ( ! targetCheckpoint ) {
		// TODO (ability-migration): Delete the delegation once the last
		// checkpoint-writing Big Sky ability migrates — every checkpoint then
		// lives in AM's own store.
		const providerCheckpoints = getProviderCheckpoints();
		if ( providerCheckpoints?.hasCheckpoint( checkpointId ) ) {
			return restoreProviderCheckpoint( providerCheckpoints, input );
		}

		return errorResult(
			__( 'I could not find a checkpoint for that ID.', __i18n_text_domain__ ),
			`Checkpoint not found: ${ checkpointId }`,
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
		setCheckpoint( reciprocalId, targetCheckpoint.checkpointKeys, {
			toolId: RESTORE_CHECKPOINT_TOOL_ID,
			summary,
			restoresCheckpointId: checkpointId,
			restoredCheckpointToolId: targetCheckpoint.toolId,
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
		return restoreFailedResult( error, checkpointId );
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

	return restoredResult( summary, checkpointId );
}
