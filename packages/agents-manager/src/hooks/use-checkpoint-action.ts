import { createElement, useCallback, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { undo, Icon } from '@wordpress/icons';
import ResolvedEditAction from '../components/resolved-edit-action';
import { getApplyBlockEditsOutcome } from '../utils/tool-message-utils';
import { recordBigSkyTracksEvent } from '../utils/tracks';
import type { UseCheckpointReturn } from '../utils/load-external-providers';
import type { UIMessage, UIMessageAction, UseAgentChatReturn } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

/**
 * Gets checkpoint details embedded in a tool message.
 *
 * Restored conversations can carry a checkpoint ID, but provider checkpoint
 * state is session-only; `hasCheckpoint` filters out stale IDs.
 */
function getCheckpointInfo(
	message: UIMessage
): { checkpointId: string; showResolvedEditAction: boolean } | undefined {
	const firstPartText = message.content?.[ 0 ]?.text ?? '';

	try {
		const parsed = JSON.parse( firstPartText );
		const blockEditOutcome = getApplyBlockEditsOutcome( parsed.tool_id, parsed.data );

		if ( blockEditOutcome === 'no-changes' ) {
			return undefined;
		}

		const checkpointId =
			parsed.data?.calypsoCheckpointId ??
			( blockEditOutcome === 'updated' ? parsed.tool_call_id : undefined );
		if ( typeof checkpointId === 'string' && checkpointId ) {
			return {
				checkpointId,
				showResolvedEditAction: blockEditOutcome === 'updated',
			};
		}
	} catch {
		// Not JSON — not a tool message.
	}

	return undefined;
}

/**
 * Registers an undo action on agent messages that have a checkpoint.
 */
export default function useCheckpointAction(
	registerMessageActions: RegisterMessageActions,
	checkpoint?: UseCheckpointReturn
): ( message: UIMessage ) => UIMessageAction[] {
	// Ref avoids infinite re-renders caused by unstable `checkpoint` reference.
	const checkpointRef = useRef( checkpoint );
	checkpointRef.current = checkpoint;
	const getCheckpointActionsForMessage = useCallback( ( message: UIMessage ): UIMessageAction[] => {
		const currentCheckpoint = checkpointRef.current;

		if ( ! currentCheckpoint || message.role !== 'agent' ) {
			return [];
		}

		const checkpointInfo = getCheckpointInfo( message );

		if ( ! checkpointInfo || ! currentCheckpoint.hasCheckpoint( checkpointInfo.checkpointId ) ) {
			return [];
		}

		const restoreCheckpoint = async (): Promise< boolean > => {
			let outcome: 'success' | 'failed' = 'failed';
			try {
				const checkpointToRestore = checkpointRef.current;
				if ( ! checkpointToRestore ) {
					return false;
				}
				await checkpointToRestore.restoreCheckpoint( checkpointInfo.checkpointId );
				outcome = 'success';
				return true;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[useCheckpointAction] Failed to restore checkpoint:', error );
				return false;
			} finally {
				recordBigSkyTracksEvent( 'restore_checkpoint_action', {
					id: checkpointInfo.checkpointId,
					outcome,
				} );
			}
		};

		if ( checkpointInfo.showResolvedEditAction ) {
			return [
				{
					type: 'component',
					id: 'checkpoint',
					label: __( 'Updated and Undo', __i18n_text_domain__ ),
					component: ResolvedEditAction,
					componentProps: { onUndo: restoreCheckpoint },
					order: 1,
				},
			];
		}

		return [
			{
				id: 'checkpoint',
				label: __( 'Undo', __i18n_text_domain__ ),
				icon: createElement( Icon, {
					icon: undo,
					className: 'agents-manager-message-action-icon',
				} ),
				onClick: async () => {
					await restoreCheckpoint();
				},
				order: 1,
			},
		];
	}, [] );

	useEffect( () => {
		registerMessageActions( {
			id: 'agents-manager-checkpoint',
			actions: getCheckpointActionsForMessage,
		} );
	}, [ getCheckpointActionsForMessage, registerMessageActions ] );

	return getCheckpointActionsForMessage;
}
