/**
 * Shared undo-snapshot store for review components. An applied edit records
 * the block content it replaced so the card's Undo can restore it later.
 */

import { useCallback, useMemo, useRef } from '@wordpress/element';
import { undoBlockEdit } from './block-actions';

interface UndoSnapshot {
	clientId: string;
	contentBefore: string;
	contentAfter: string;
	editableAttribute?: string;
}

/** The subset of an `applyReviewEdit` result the snapshot needs. */
interface ApplyResultLike {
	success: boolean;
	clientId?: string;
	contentBefore?: string;
	contentAfter?: string;
	editableAttribute?: string;
}

export type UndoSnapshotOutcome = 'success' | 'failed' | 'missing_snapshot';

/**
 * Keeps one undo snapshot per review item and reverts it on demand. Status
 * and event reporting stay with the calling component — the outcomes differ
 * per tool.
 */
export default function useUndoSnapshots< Key extends string | number >(): {
	saveFromApplyResult: ( key: Key, result: ApplyResultLike ) => boolean;
	undo: ( key: Key, requireSnapshot: boolean ) => UndoSnapshotOutcome;
} {
	const snapshots = useRef< Partial< Record< Key, UndoSnapshot > > >( {} );

	/** Stores the snapshot when the apply result carries a complete one. */
	const saveFromApplyResult = useCallback( ( key: Key, result: ApplyResultLike ): boolean => {
		if (
			result.success &&
			result.clientId &&
			typeof result.contentBefore === 'string' &&
			typeof result.contentAfter === 'string'
		) {
			snapshots.current[ key ] = {
				clientId: result.clientId,
				contentBefore: result.contentBefore,
				contentAfter: result.contentAfter,
				editableAttribute: result.editableAttribute,
			};
			return true;
		}
		return false;
	}, [] );

	/**
	 * Reverts the stored edit. Pass `requireSnapshot` for items whose applied
	 * state must have a snapshot — losing it makes the undo a failure rather
	 * than a plain status reset (as for a dismissed item).
	 */
	const undo = useCallback( ( key: Key, requireSnapshot: boolean ): UndoSnapshotOutcome => {
		const snapshot = snapshots.current[ key ];
		if ( requireSnapshot && ! snapshot ) {
			return 'missing_snapshot';
		}
		if ( snapshot ) {
			if (
				! undoBlockEdit(
					snapshot.clientId,
					snapshot.contentBefore,
					snapshot.contentAfter,
					snapshot.editableAttribute
				)
			) {
				return 'failed';
			}
			delete snapshots.current[ key ];
		}
		return 'success';
	}, [] );

	// Stable identity so components can list the store itself as a dependency.
	return useMemo( () => ( { saveFromApplyResult, undo } ), [ saveFromApplyResult, undo ] );
}
