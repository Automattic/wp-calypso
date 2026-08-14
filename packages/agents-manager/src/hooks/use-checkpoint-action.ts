import { createElement, useCallback, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { undo, Icon } from '@wordpress/icons';
import ResolvedEditAction from '../components/resolved-edit-action';
import {
	APPLY_BLOCK_EDITS_TOOL_ID,
	getApplyBlockEditsOutcome,
	UPDATE_BLOCK_CONTENT_TOOL_ID,
} from '../utils/tool-message-utils';
import { recordBigSkyTracksEvent } from '../utils/tracks';
import type { UseCheckpointReturn } from '../utils/load-external-providers';
import type { UIMessage, UIMessageAction, UseAgentChatReturn } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];
type IsCheckpointActionAvailable = ( checkpointId: string ) => boolean;
type OnCheckpointActionPendingChange = ( checkpointId: string, isPending: boolean ) => void;

const revertedCheckpointIds = new Set< string >();
const invalidatedCheckpointIds = new Set< string >();

function isTextContentEdit( toolId: unknown, data: unknown ): boolean {
	if ( toolId === UPDATE_BLOCK_CONTENT_TOOL_ID ) {
		return true;
	}

	if ( toolId !== APPLY_BLOCK_EDITS_TOOL_ID || typeof data !== 'object' || data === null ) {
		return false;
	}

	const toolData = data as {
		calypsoCheckpointId?: unknown;
		result?: {
			changeType?: unknown;
			details?: { attributeResults?: unknown };
		};
	};

	if ( ! toolData.result ) {
		return typeof toolData.calypsoCheckpointId === 'string' && !! toolData.calypsoCheckpointId;
	}
	if ( toolData.result.changeType !== undefined ) {
		return toolData.result.changeType === 'text-content';
	}

	return (
		Array.isArray( toolData.result.details?.attributeResults ) &&
		toolData.result.details.attributeResults.some(
			( result ) =>
				typeof result === 'object' &&
				result !== null &&
				( result as { path?: unknown } ).path === 'content' &&
				( result as { status?: unknown } ).status === 'changed'
		)
	);
}

/**
 * Gets checkpoint details embedded in a tool message.
 *
 * Restored conversations can carry a checkpoint ID, but provider checkpoint
 * state is session-only; `hasCheckpoint` filters out stale IDs.
 */
function getCheckpointInfo(
	message: Pick< UIMessage, 'content' >
): { checkpointId: string; showResolvedEditAction: boolean } | undefined {
	const firstPartText = message.content?.[ 0 ]?.text ?? '';

	try {
		const parsed = JSON.parse( firstPartText );
		const blockEditOutcome = getApplyBlockEditsOutcome( parsed.tool_id, parsed.data );

		if (
			blockEditOutcome === 'no-changes' ||
			( blockEditOutcome === 'updated' && ! isTextContentEdit( parsed.tool_id, parsed.data ) )
		) {
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

export function getCheckpointIdForMessage( message: Pick< UIMessage, 'content' > ): string | null {
	return getCheckpointInfo( message )?.checkpointId ?? null;
}

export function invalidateCheckpointAction( checkpointId: string ): void {
	invalidatedCheckpointIds.add( checkpointId );
}

/**
 * Registers an undo action on agent messages that have a checkpoint.
 */
export default function useCheckpointAction(
	registerMessageActions: RegisterMessageActions,
	checkpoint?: UseCheckpointReturn,
	isCheckpointActionAvailable?: IsCheckpointActionAvailable,
	onCheckpointActionPendingChange?: OnCheckpointActionPendingChange
): ( message: UIMessage ) => UIMessageAction[] {
	// Refs avoid infinite re-renders caused by unstable provider values.
	const checkpointRef = useRef( checkpoint );
	checkpointRef.current = checkpoint;
	const isCheckpointActionAvailableRef = useRef( isCheckpointActionAvailable );
	isCheckpointActionAvailableRef.current = isCheckpointActionAvailable;
	const onCheckpointActionPendingChangeRef = useRef( onCheckpointActionPendingChange );
	onCheckpointActionPendingChangeRef.current = onCheckpointActionPendingChange;
	const pendingSwapCheckpointIdsRef = useRef( new Set< string >() );
	const getCheckpointActionsForMessage = useCallback( ( message: UIMessage ): UIMessageAction[] => {
		const currentCheckpoint = checkpointRef.current;

		if ( ! currentCheckpoint || message.role !== 'agent' ) {
			return [];
		}

		const checkpointInfo = getCheckpointInfo( message );

		if ( ! checkpointInfo || ! currentCheckpoint.hasCheckpoint( checkpointInfo.checkpointId ) ) {
			return [];
		}

		const isReverted = revertedCheckpointIds.has( checkpointInfo.checkpointId );
		const isActionAvailable =
			! invalidatedCheckpointIds.has( checkpointInfo.checkpointId ) &&
			( isCheckpointActionAvailableRef.current?.( checkpointInfo.checkpointId ) ?? true );
		const swapAvailability =
			isActionAvailable &&
			typeof currentCheckpoint.canSwapCheckpoint === 'function' &&
			typeof currentCheckpoint.swapCheckpoint === 'function'
				? pendingSwapCheckpointIdsRef.current.has( checkpointInfo.checkpointId ) ||
				  currentCheckpoint.canSwapCheckpoint( checkpointInfo.checkpointId )
				: undefined;
		const supportsSwap = swapAvailability !== undefined;
		const applyCheckpointAction = async ( revert: boolean ): Promise< boolean > => {
			if ( pendingSwapCheckpointIdsRef.current.has( checkpointInfo.checkpointId ) ) {
				return false;
			}

			let outcome: 'success' | 'failed' = 'failed';
			let didStartSwap = false;
			try {
				const checkpointToRestore = checkpointRef.current;
				if (
					invalidatedCheckpointIds.has( checkpointInfo.checkpointId ) ||
					isCheckpointActionAvailableRef.current?.( checkpointInfo.checkpointId ) === false ||
					! checkpointToRestore ||
					! checkpointToRestore.hasCheckpoint( checkpointInfo.checkpointId )
				) {
					return false;
				}

				if ( supportsSwap ) {
					if (
						checkpointToRestore.canSwapCheckpoint?.( checkpointInfo.checkpointId ) !== true ||
						! checkpointToRestore.swapCheckpoint
					) {
						return false;
					}
					pendingSwapCheckpointIdsRef.current.add( checkpointInfo.checkpointId );
					onCheckpointActionPendingChangeRef.current?.( checkpointInfo.checkpointId, true );
					didStartSwap = true;
					await checkpointToRestore.swapCheckpoint( checkpointInfo.checkpointId );
				} else {
					await checkpointToRestore.restoreCheckpoint( checkpointInfo.checkpointId );
				}

				if ( revert ) {
					revertedCheckpointIds.add( checkpointInfo.checkpointId );
				} else {
					revertedCheckpointIds.delete( checkpointInfo.checkpointId );
				}
				outcome = 'success';
				return true;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[useCheckpointAction] Failed to restore checkpoint:', error );
				return false;
			} finally {
				if ( didStartSwap ) {
					pendingSwapCheckpointIdsRef.current.delete( checkpointInfo.checkpointId );
					onCheckpointActionPendingChangeRef.current?.( checkpointInfo.checkpointId, false );
				}
				recordBigSkyTracksEvent( 'restore_checkpoint_action', {
					action: revert ? 'undo' : 'redo',
					id: checkpointInfo.checkpointId,
					outcome,
				} );
			}
		};

		if ( checkpointInfo.showResolvedEditAction ) {
			const canAct = isActionAvailable && ( ! supportsSwap || swapAvailability === true );
			let label: string = canAct
				? __( 'Updated and Undo', __i18n_text_domain__ )
				: __( 'Updated', __i18n_text_domain__ );
			if ( isReverted ) {
				label =
					canAct && supportsSwap
						? __( 'Reverted and Redo', __i18n_text_domain__ )
						: __( 'Reverted', __i18n_text_domain__ );
			}
			return [
				{
					type: 'component',
					id: 'checkpoint',
					label,
					component: ResolvedEditAction,
					componentProps: {
						initiallyReverted: isReverted,
						...( canAct && { onUndo: () => applyCheckpointAction( true ) } ),
						...( canAct &&
							supportsSwap && {
								onRedo: () => applyCheckpointAction( false ),
							} ),
					},
					order: 1,
				},
			];
		}

		if ( ! isActionAvailable ) {
			return [];
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
					await applyCheckpointAction( true );
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
