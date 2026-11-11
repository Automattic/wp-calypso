import { select as selectDataStore, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { getCheckpointTurns } from '../utils/checkpoint-turns';
import useCheckpointAction, {
	invalidateCheckpointAction,
	isCheckpointActionInvalidated,
	setCheckpointActionReverted,
} from './use-checkpoint-action';
import type { UseCheckpointHook } from '../utils/load-external-providers';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

// The editor store is optional outside Gutenberg.
function getHasEditorRedo( select: ( storeName: string ) => unknown ): boolean {
	try {
		const editor = select( 'core/editor' ) as { hasEditorRedo?: () => boolean };
		return editor?.hasEditorRedo?.() ?? false;
	} catch {
		return false;
	}
}

interface UseCheckpointAvailabilityOptions {
	messages: UIMessage[];
	registerMessageActions: UseAgentChatReturn[ 'registerMessageActions' ];
	useCheckpoint: UseCheckpointHook | undefined;
	/**
	 * The streamed message behind a message, which carries its checkpoint. Its
	 * identity changes when the session switches.
	 */
	getCheckpointMessage: ( message: UIMessage ) => UIMessage;
}

/**
 * Registers each checkpoint's Undo and decides how it shows: enabled on the
 * latest turn, disabled on earlier turns, and hidden or marked reverted once the
 * editor's content no longer matches what the checkpoint would swap.
 *
 * Two things move the content without the chat: edits that drift it away from
 * the checkpoint (source drift), and Gutenberg's own Undo and Redo. Gutenberg
 * notifies its history and block stores separately, so a native Undo is only
 * confirmed once both have changed.
 *
 * Returns a getter for a message's checkpoint actions.
 */
export function useCheckpointAvailability( {
	messages,
	registerMessageActions,
	useCheckpoint,
	getCheckpointMessage,
}: UseCheckpointAvailabilityOptions ) {
	const [ sourceDriftInvalidatedCheckpointIds, setSourceDriftInvalidatedCheckpointIds ] = useState<
		Set< string >
	>( new Set() );
	const pendingCheckpointActionIdsRef = useRef( new Set< string >() );
	const completedInlineUndoCheckpointIdRef = useRef< string | undefined >( undefined );
	// Bumped when checkpoint state held outside React changes, to re-render and re-run the checks.
	const [ checkpointActionRevision, setCheckpointActionRevision ] = useState( 0 );

	const hasEditorRedo = useSelect( ( select ) => getHasEditorRedo( select ), [] );
	const previousHasEditorRedoRef = useRef( hasEditorRedo );

	const checkpoint = useCheckpoint?.();
	const checkpointRef = useRef( checkpoint );
	checkpointRef.current = checkpoint;

	const handleCheckpointActionPendingChange = useCallback(
		( checkpointId: string, isPending: boolean, completedAction?: 'undo' | 'redo' ) => {
			if ( isPending ) {
				completedInlineUndoCheckpointIdRef.current = undefined;
				pendingCheckpointActionIdsRef.current.add( checkpointId );
				return;
			}

			if ( pendingCheckpointActionIdsRef.current.delete( checkpointId ) ) {
				const hasEditorRedoNow = getHasEditorRedo( selectDataStore );

				// The provider can settle after history renders but before the history effect processes it.
				completedInlineUndoCheckpointIdRef.current =
					completedAction === 'undo' && ! previousHasEditorRedoRef.current && hasEditorRedoNow
						? checkpointId
						: undefined;
				setCheckpointActionRevision( ( revision ) => revision + 1 );
			}
		},
		[]
	);

	const handleCheckpointActionInvalidated = useCallback( () => {
		setCheckpointActionRevision( ( revision ) => revision + 1 );
	}, [] );

	const checkpointTurns = useMemo(
		() => getCheckpointTurns( messages, getCheckpointMessage ),
		[ getCheckpointMessage, messages ]
	);

	// The latest turn a native Undo moved. Seeded at mount when Redo is already
	// available: an Undo may already have moved it.
	const nativeUndoInvalidatedTurnRef = useRef(
		hasEditorRedo ? checkpointTurns.latestUserMessageId : undefined
	);
	const [ nativeUndoRevertedTurn, setNativeUndoRevertedTurn ] = useState< string | undefined >();
	const pendingNativeUndoTurnRef = useRef< string | undefined >( undefined );
	const pendingNativeRedoTurnRef = useRef< string | undefined >( undefined );

	const supportsCheckpointSwap =
		typeof checkpoint?.canSwapCheckpoint === 'function' &&
		typeof checkpoint.swapCheckpoint === 'function';
	const isWatchingNativeHistory =
		!! checkpointTurns.latestUserMessageId &&
		( nativeUndoRevertedTurn === checkpointTurns.latestUserMessageId ||
			pendingNativeUndoTurnRef.current === checkpointTurns.latestUserMessageId );
	const hasPendingCheckpointSwap =
		supportsCheckpointSwap &&
		( isWatchingNativeHistory ||
			[ ...checkpointTurns.latestTurnCheckpointIds ].some(
				( checkpointId ) =>
					! sourceDriftInvalidatedCheckpointIds.has( checkpointId ) &&
					! isCheckpointActionInvalidated( checkpointId )
			) );

	// Watched only while a checkpoint can still be swapped, so typing elsewhere
	// doesn't re-run the checks below.
	const checkpointEditorBlocks = useSelect(
		( select ) => {
			if ( ! hasPendingCheckpointSwap ) {
				return undefined;
			}

			try {
				const blockEditor = select( 'core/block-editor' ) as { getBlocks?: () => unknown[] };
				return blockEditor?.getBlocks?.();
			} catch {
				return undefined;
			}
		},
		[ checkpointTurns, hasPendingCheckpointSwap, useCheckpoint ]
	);

	// Source drift: hides the Undo of a latest-turn checkpoint the editor content
	// no longer matches, unless Gutenberg's own history explains the change.
	// Also re-checks when the editor blocks, the checkpoint state or the session change.
	useEffect( () => {
		const currentCheckpoint = checkpointRef.current;
		const nextInvalidatedCheckpointIds = new Set(
			[ ...sourceDriftInvalidatedCheckpointIds ].filter( ( checkpointId ) =>
				checkpointTurns.latestTurnCheckpointIds.has( checkpointId )
			)
		);
		let didChange = nextInvalidatedCheckpointIds.size !== sourceDriftInvalidatedCheckpointIds.size;

		const shouldDeferSourceDriftInvalidation =
			hasEditorRedo &&
			!! checkpointTurns.latestUserMessageId &&
			( previousHasEditorRedoRef.current === false ||
				pendingNativeUndoTurnRef.current === checkpointTurns.latestUserMessageId ||
				nativeUndoInvalidatedTurnRef.current === checkpointTurns.latestUserMessageId );

		if ( supportsCheckpointSwap && currentCheckpoint ) {
			for ( const checkpointId of checkpointTurns.latestTurnCheckpointIds ) {
				if (
					! shouldDeferSourceDriftInvalidation &&
					! nextInvalidatedCheckpointIds.has( checkpointId ) &&
					! pendingCheckpointActionIdsRef.current.has( checkpointId ) &&
					currentCheckpoint.canSwapCheckpoint?.( checkpointId ) === false
				) {
					nextInvalidatedCheckpointIds.add( checkpointId );
					invalidateCheckpointAction( checkpointId );
					didChange = true;
				}
			}
		}

		if ( didChange ) {
			setSourceDriftInvalidatedCheckpointIds( nextInvalidatedCheckpointIds );
		}
	}, [
		checkpointActionRevision,
		checkpointEditorBlocks,
		checkpointTurns,
		hasEditorRedo,
		sourceDriftInvalidatedCheckpointIds,
		supportsCheckpointSwap,
		useCheckpoint,
	] );

	const getActionsForMessage = useCheckpointAction(
		registerMessageActions,
		checkpoint,
		( checkpointId ) => {
			if ( sourceDriftInvalidatedCheckpointIds.has( checkpointId ) ) {
				return 'hidden';
			}

			const checkpointUserMessageId =
				checkpointTurns.userMessageIdByCheckpointId.get( checkpointId );
			if (
				checkpointUserMessageId &&
				( pendingNativeUndoTurnRef.current === checkpointUserMessageId ||
					nativeUndoInvalidatedTurnRef.current === checkpointUserMessageId )
			) {
				return 'hidden';
			}

			if ( ! checkpointTurns.latestTurnCheckpointIds.has( checkpointId ) ) {
				return 'disabled';
			}

			if ( hasEditorRedo && checkpointRef.current?.canSwapCheckpoint?.( checkpointId ) !== true ) {
				return 'hidden';
			}

			return 'enabled';
		},
		handleCheckpointActionPendingChange,
		handleCheckpointActionInvalidated
	);

	// Gutenberg's own Undo and Redo: marks the latest turn's checkpoint reverted
	// or updated to match, and hides the Undo of a turn native history moved.
	const previousCheckpointEditorBlocksRef = useRef( checkpointEditorBlocks );
	useEffect( () => {
		const { latestTurnCheckpointIds, latestUserMessageId } = checkpointTurns;

		// Native history can notify before block content; a later or combined block change confirms Undo.
		const didCheckpointEditorBlocksChange =
			previousCheckpointEditorBlocksRef.current !== undefined &&
			checkpointEditorBlocks !== undefined &&
			previousCheckpointEditorBlocksRef.current !== checkpointEditorBlocks;
		previousCheckpointEditorBlocksRef.current = checkpointEditorBlocks;

		const checkpointIds = [ ...latestTurnCheckpointIds ];
		const latestCheckpointId = checkpointIds[ checkpointIds.length - 1 ];
		const latestCheckpointCanSwap = latestCheckpointId
			? checkpointRef.current?.canSwapCheckpoint?.( latestCheckpointId )
			: undefined;
		const hasPendingCheckpointAction = checkpointIds.some( ( checkpointId ) =>
			pendingCheckpointActionIdsRef.current.has( checkpointId )
		);

		const didEditorRedoBecomeAvailable =
			previousHasEditorRedoRef.current === false && hasEditorRedo;
		const didEditorRedoBecomeUnavailable =
			previousHasEditorRedoRef.current === true && ! hasEditorRedo;
		const didInlineUndoCreateEditorRedo =
			didEditorRedoBecomeAvailable &&
			completedInlineUndoCheckpointIdRef.current !== undefined &&
			latestTurnCheckpointIds.has( completedInlineUndoCheckpointIdRef.current );
		const wasPendingNativeUndo =
			!! latestUserMessageId && pendingNativeUndoTurnRef.current === latestUserMessageId;

		let didInvalidateCheckpointAction = false;
		let shouldConfirmNativeUndo = false;
		let didCheckpointActionAvailabilityChange = false;

		const clearPendingNativeUndo = () => {
			if ( pendingNativeUndoTurnRef.current !== undefined ) {
				didCheckpointActionAvailabilityChange = true;
			}
			pendingNativeUndoTurnRef.current = undefined;
		};

		// A new turn started before a pending native Undo was confirmed: treat that Undo as done.
		const supersededPendingNativeUndoTurn =
			pendingNativeUndoTurnRef.current && pendingNativeUndoTurnRef.current !== latestUserMessageId
				? pendingNativeUndoTurnRef.current
				: undefined;
		if ( supersededPendingNativeUndoTurn ) {
			pendingNativeUndoTurnRef.current = undefined;
			nativeUndoInvalidatedTurnRef.current = supersededPendingNativeUndoTurn;
			didCheckpointActionAvailabilityChange = true;
			for ( const [ checkpointId, userMessageId ] of checkpointTurns.userMessageIdByCheckpointId ) {
				if (
					userMessageId === supersededPendingNativeUndoTurn &&
					! isCheckpointActionInvalidated( checkpointId )
				) {
					invalidateCheckpointAction( checkpointId );
					didInvalidateCheckpointAction = true;
				}
			}
		}

		if ( hasPendingCheckpointAction ) {
			clearPendingNativeUndo();
			pendingNativeRedoTurnRef.current = undefined;
		}

		if ( didEditorRedoBecomeAvailable ) {
			completedInlineUndoCheckpointIdRef.current = undefined;
			pendingNativeRedoTurnRef.current = undefined;
			clearPendingNativeUndo();

			if (
				! didInlineUndoCreateEditorRedo &&
				! hasPendingCheckpointAction &&
				latestCheckpointId &&
				latestUserMessageId
			) {
				if ( didCheckpointEditorBlocksChange && latestCheckpointCanSwap === false ) {
					shouldConfirmNativeUndo = true;
				} else if ( latestCheckpointCanSwap !== undefined ) {
					pendingNativeUndoTurnRef.current = latestUserMessageId;
					didCheckpointActionAvailabilityChange = true;
				} else {
					nativeUndoInvalidatedTurnRef.current = latestUserMessageId;
				}
			} else if (
				! didInlineUndoCreateEditorRedo &&
				! hasPendingCheckpointAction &&
				latestCheckpointCanSwap === undefined
			) {
				nativeUndoInvalidatedTurnRef.current = latestUserMessageId;
			}
		}

		if (
			hasEditorRedo &&
			! hasPendingCheckpointAction &&
			didCheckpointEditorBlocksChange &&
			latestCheckpointId &&
			latestUserMessageId &&
			wasPendingNativeUndo
		) {
			pendingNativeUndoTurnRef.current = undefined;
			didCheckpointActionAvailabilityChange = true;
			if ( latestCheckpointCanSwap === false ) {
				shouldConfirmNativeUndo = true;
			}
		}

		if ( shouldConfirmNativeUndo && latestCheckpointId && latestUserMessageId ) {
			nativeUndoInvalidatedTurnRef.current = latestUserMessageId;
			if (
				! sourceDriftInvalidatedCheckpointIds.has( latestCheckpointId ) &&
				! isCheckpointActionInvalidated( latestCheckpointId )
			) {
				if ( setCheckpointActionReverted( latestCheckpointId, true ) ) {
					setCheckpointActionRevision( ( revision ) => revision + 1 );
				}
				setNativeUndoRevertedTurn( latestUserMessageId );
			}
		}

		if (
			didEditorRedoBecomeUnavailable &&
			latestUserMessageId &&
			nativeUndoRevertedTurn === latestUserMessageId
		) {
			// Exact checkpoint content confirms Updated, even when the user recreates it manually.
			pendingNativeRedoTurnRef.current = latestUserMessageId;
		}

		if ( didEditorRedoBecomeUnavailable ) {
			clearPendingNativeUndo();
		}

		previousHasEditorRedoRef.current = hasEditorRedo;

		if (
			! hasEditorRedo &&
			latestCheckpointId &&
			latestUserMessageId &&
			pendingNativeRedoTurnRef.current === latestUserMessageId &&
			checkpointRef.current?.canSwapCheckpoint?.( latestCheckpointId ) === true
		) {
			if ( setCheckpointActionReverted( latestCheckpointId, false ) ) {
				setCheckpointActionRevision( ( revision ) => revision + 1 );
			}
			setNativeUndoRevertedTurn( undefined );
			pendingNativeRedoTurnRef.current = undefined;
		}

		for ( const checkpointId of checkpointIds ) {
			if (
				latestUserMessageId &&
				nativeUndoInvalidatedTurnRef.current === latestUserMessageId &&
				! isCheckpointActionInvalidated( checkpointId )
			) {
				invalidateCheckpointAction( checkpointId );
				didInvalidateCheckpointAction = true;
			}
		}

		if ( didInvalidateCheckpointAction || didCheckpointActionAvailabilityChange ) {
			setCheckpointActionRevision( ( revision ) => revision + 1 );
		}
	}, [
		checkpointEditorBlocks,
		checkpointTurns,
		hasEditorRedo,
		nativeUndoRevertedTurn,
		sourceDriftInvalidatedCheckpointIds,
	] );

	// The action getter reads this state through refs, so give it a new identity
	// whenever the state changes, for memoized callers.
	return useCallback(
		( message: UIMessage ) => getActionsForMessage( message ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			getActionsForMessage,
			checkpointActionRevision,
			hasEditorRedo,
			sourceDriftInvalidatedCheckpointIds,
		]
	);
}
