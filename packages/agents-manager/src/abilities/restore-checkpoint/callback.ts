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
import {
	getProviderCheckpoint,
	getProviderCheckpointRecords,
	getProviderCheckpoints,
} from '../../utils/provider-checkpoints';
import { getToolCallIdFromConversationHistory } from '../../utils/tool-call-history';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import { errorResult, successResult } from '../ability-result';
import type { CheckpointMetadata, CheckpointRecord } from '../../utils/checkpoints';
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
	reciprocalRequestIntentType: RestoreCheckpointInput[ 'requestIntentType' ],
	providerCheckpoints: UseCheckpointReturn | undefined
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

	// TODO (ability-migration): Delete this provider-store sweep with the
	// bridge. Until then, reciprocals live in whichever store held their
	// restore's target, so both stores are swept.
	if ( providerCheckpoints ) {
		getProviderCheckpointRecords()
			.filter( isStaleReciprocal )
			.forEach( ( { id } ) => providerCheckpoints.clearCheckpoint( id ) );
	}
}

// Restores a checkpoint Big Sky still holds, since its tools write to its own
// store until they migrate. The reciprocal goes there too, scoped to the
// target's keys: a keyless one would redo through Big Sky's legacy full-snapshot
// path and re-apply stale variation titles over AM-applied styles, so an
// unreadable or keyless target gets none. The page-rename flip and navigation
// snapshots are copied as Big Sky's tool does.
async function restoreProviderCheckpoint(
	providerCheckpoints: UseCheckpointReturn,
	{ checkpointId, summary, requestIntentType = 'restore' }: RestoreCheckpointInput
): Promise< AbilityResult > {
	const targetCheckpoint = getProviderCheckpoint( checkpointId );
	const restoreToolCallId = getToolCallIdFromConversationHistory( RESTORE_CHECKPOINT_TOOL_ID );
	const reciprocalRequestIntentType = getReciprocalRequestIntentType( requestIntentType );
	const reciprocalId =
		targetCheckpoint &&
		restoreToolCallId &&
		! hasCheckpoint( restoreToolCallId ) &&
		! providerCheckpoints.hasCheckpoint( restoreToolCallId )
			? restoreToolCallId
			: null;

	if ( reciprocalId && targetCheckpoint ) {
		try {
			const { pageRename } = targetCheckpoint;
			// `toolCallId` matches Big Sky's own record shape in its store.
			providerCheckpoints.setCheckpoint( reciprocalId, targetCheckpoint.checkpointKeys, {
				toolCallId: reciprocalId,
				toolId: RESTORE_CHECKPOINT_TOOL_ID,
				summary,
				restoresCheckpointId: checkpointId,
				requestIntentType: reciprocalRequestIntentType,
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
			Object.keys( targetCheckpoint.navigationRecords ?? {} ).forEach( ( navigationId ) =>
				providerCheckpoints.addNavigationToCheckpoint?.( reciprocalId, navigationId )
			);
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error(
				`[AgentsManager] Failed to record a redo checkpoint for ${ checkpointId }:`,
				error
			);

			// Redo bookkeeping must not block the restore — drop the partial
			// record and proceed without one; no redo beats a wrong one.
			providerCheckpoints.clearCheckpoint( reciprocalId );
		}
	}

	try {
		await providerCheckpoints.restoreCheckpoint( checkpointId );
	} catch ( error ) {
		if ( reciprocalId ) {
			providerCheckpoints.clearCheckpoint( reciprocalId );
		}
		return restoreFailedResult( error, checkpointId );
	}

	if ( restoreToolCallId ) {
		clearStaleReciprocals( restoreToolCallId, reciprocalRequestIntentType, providerCheckpoints );
	}

	return successResult( summary, { checkpointId } );
}

// The reciprocal an undo or restore of `checkpointId` recorded, while no redo
// has used it: it re-applies the change. A redo's own reciprocal carries `undo`.
function findRedoReciprocal( checkpointId: string ): CheckpointRecord | undefined {
	const checkpoints = getCheckpoints();

	return [ ...checkpoints ]
		.reverse()
		.find(
			( checkpoint ) =>
				checkpoint.toolId === RESTORE_CHECKPOINT_TOOL_ID &&
				checkpoint.restoresCheckpointId === checkpointId &&
				checkpoint.requestIntentType !== 'undo' &&
				! checkpoints.some( ( other ) => other.restoresCheckpointId === checkpoint.id )
		);
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

	const requestedCheckpoint = getCheckpoint( checkpointId );
	if ( ! requestedCheckpoint ) {
		// TODO (ability-migration): Delete the delegation with the
		// provider-checkpoints bridge (AM-72) — until Big Sky's copies go, an id
		// written under `?am_abilities=0` still lives in its store.
		const providerCheckpoints = getProviderCheckpoints();
		if ( providerCheckpoints?.hasCheckpoint( checkpointId ) ) {
			return restoreProviderCheckpoint( providerCheckpoints, input );
		}

		return errorResult(
			`Checkpoint not found: ${ checkpointId }`,
			__( 'I could not find a checkpoint for that ID.', __i18n_text_domain__ ),
			{ checkpointId }
		);
	}

	// A redo may name the undone change itself, whose checkpoint would only put
	// back the undone state; it runs from the undo's reciprocal instead.
	const targetCheckpoint =
		( requestIntentType === 'redo' && findRedoReciprocal( checkpointId ) ) || requestedCheckpoint;

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
				restoresCheckpointId: targetCheckpoint.id,
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
		await restoreCheckpoint( targetCheckpoint.id );
	} catch ( error ) {
		// The reciprocal is kept: domains restore in sequence and several persist,
		// so a failure part-way leaves the site changed with this as the only way
		// back. Where nothing was restored, redoing to the current state is free.
		return restoreFailedResult( error, checkpointId );
	}

	if ( restoreToolCallId ) {
		clearStaleReciprocals(
			restoreToolCallId,
			reciprocalRequestIntentType,
			getProviderCheckpoints()
		);
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
