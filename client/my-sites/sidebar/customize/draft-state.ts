/**
 * Customizer draft-state machine.
 *
 * Calypso-side mirror of the public plugin's `customizer/draft-state.js`
 * (`WordPress/wp-admin-sidebar` v0.1.4): pure data layer holding the saved
 * `LayoutDelta` and the user's working copy. Mutations return new objects
 * so React's `useState`/`useReducer` reference equality picks up changes.
 *
 * Identical-behaviour anchor: Phase 2 row 26 (working delta lifecycle).
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/draft-state.js
 */

import {
	EMPTY_LAYOUT_DELTA,
	type LayoutDelta,
	type LayoutPosition,
} from 'calypso/state/admin-sidebar/layout/types';

export interface CustomizerDraftState {
	savedDelta: LayoutDelta;
	workingDelta: LayoutDelta;
	isDirty: boolean;
	isSaving: boolean;
	saveError: { code: string; message: string } | null;
	activeDrag: { itemId: string; sourcePosition: LayoutPosition } | null;
}

/**
 * Empty-delta factory. Returns a fresh object every call (Object.freeze()
 * on EMPTY_LAYOUT_DELTA forbids mutation; clones are safer for downstream
 * mutators).
 */
export function emptyDelta(): LayoutDelta {
	return cloneDelta( EMPTY_LAYOUT_DELTA );
}

/**
 * Deep-ish clone for a LayoutDelta. Overrides are flat objects; structuredClone
 * would also work but is unnecessary here.
 */
export function cloneDelta( d: LayoutDelta ): LayoutDelta {
	return {
		version: d.version,
		updated_at: d.updated_at,
		overrides: d.overrides.map( ( o ) => ( {
			itemId: o.itemId,
			position: { ...o.position },
		} ) ),
	};
}

/**
 * Build the initial draft state from the saved delta from server (or null
 * for new users).
 */
export function createDraftState(
	savedDelta: LayoutDelta | null | undefined
): CustomizerDraftState {
	const saved =
		savedDelta && Array.isArray( savedDelta.overrides ) ? cloneDelta( savedDelta ) : emptyDelta();
	return {
		savedDelta: saved,
		workingDelta: cloneDelta( saved ),
		isDirty: false,
		isSaving: false,
		saveError: null,
		activeDrag: null,
	};
}

/**
 * Equality check on two deltas. Order matters — overrides are an ordered list.
 * Mirrors `deltasEqual()` in the public plugin's `draft-state.js`.
 */
export function deltasEqual( a: LayoutDelta, b: LayoutDelta ): boolean {
	if ( a.overrides.length !== b.overrides.length ) {
		return false;
	}
	for ( let i = 0; i < a.overrides.length; i++ ) {
		const x = a.overrides[ i ];
		const y = b.overrides[ i ];
		if ( x.itemId !== y.itemId ) {
			return false;
		}
		if ( x.position.kind !== y.position.kind ) {
			return false;
		}
		if ( x.position.index !== y.position.index ) {
			return false;
		}
		if (
			x.position.kind === 'in_group' &&
			y.position.kind === 'in_group' &&
			x.position.group_id !== y.position.group_id
		) {
			return false;
		}
	}
	return true;
}

/**
 * Recompute `isDirty` by comparing working vs saved.
 */
export function recomputeDirty( state: CustomizerDraftState ): CustomizerDraftState {
	const dirty = ! deltasEqual( state.workingDelta, state.savedDelta );
	if ( dirty === state.isDirty ) {
		return state;
	}
	return { ...state, isDirty: dirty };
}

/**
 * Replace the saved delta after an auto-save response without changing the
 * current working delta. If another move happened while the request was in
 * flight, the working copy stays ahead and remains dirty.
 */
export function updateSaved(
	state: CustomizerDraftState,
	saved: LayoutDelta
): CustomizerDraftState {
	const cloned = cloneDelta( saved );
	return recomputeDirty( {
		...state,
		savedDelta: cloned,
		isSaving: false,
		saveError: null,
	} );
}

/**
 * Restore the working delta to a previous snapshot, used by Undo.
 */
export function restoreWorking(
	state: CustomizerDraftState,
	working: LayoutDelta
): CustomizerDraftState {
	return recomputeDirty( {
		...state,
		workingDelta: cloneDelta( working ),
		saveError: null,
	} );
}

/**
 * Move an item to a new position. Removes any prior override for the same
 * itemId, then appends the new one. The renderer applies overrides in array
 * order so later overrides win when duplicates ever sneak in.
 */
export function moveItem(
	state: CustomizerDraftState,
	itemId: string,
	position: LayoutPosition
): CustomizerDraftState {
	const overrides = state.workingDelta.overrides.filter( ( o ) => o.itemId !== itemId );
	overrides.push( { itemId, position: { ...position } } );
	return recomputeDirty( {
		...state,
		workingDelta: { ...state.workingDelta, overrides },
	} );
}

/**
 * Drop an override (revert one item to its default position).
 */
export function resetItem( state: CustomizerDraftState, itemId: string ): CustomizerDraftState {
	const overrides = state.workingDelta.overrides.filter( ( o ) => o.itemId !== itemId );
	return recomputeDirty( {
		...state,
		workingDelta: { ...state.workingDelta, overrides },
	} );
}

/**
 * Replace the saved delta and reset working to match. Called after a
 * successful POST so subsequent edits compute isDirty against the new server
 * truth.
 */
export function applySaved(
	state: CustomizerDraftState,
	saved: LayoutDelta
): CustomizerDraftState {
	const cloned = cloneDelta( saved );
	return {
		...state,
		savedDelta: cloned,
		workingDelta: cloneDelta( cloned ),
		isDirty: false,
		isSaving: false,
		saveError: null,
	};
}

/**
 * Discard local changes — reset working to match saved. Used by Cancel.
 */
export function cancel( state: CustomizerDraftState ): CustomizerDraftState {
	return {
		...state,
		workingDelta: cloneDelta( state.savedDelta ),
		isDirty: false,
		isSaving: false,
		saveError: null,
	};
}

/**
 * Mark the start of a drag. Does not mutate the delta.
 */
export function beginDrag(
	state: CustomizerDraftState,
	itemId: string,
	sourcePosition: LayoutPosition
): CustomizerDraftState {
	return { ...state, activeDrag: { itemId, sourcePosition } };
}

export function endDrag( state: CustomizerDraftState ): CustomizerDraftState {
	if ( state.activeDrag === null ) {
		return state;
	}
	return { ...state, activeDrag: null };
}
