import {
	applySaved,
	beginDrag,
	cancel,
	cloneDelta,
	createDraftState,
	deltasEqual,
	emptyDelta,
	endDrag,
	moveItem,
	recomputeDirty,
	resetItem,
} from '../draft-state';
import type { LayoutDelta } from 'calypso/state/admin-sidebar/layout/types';

const samplePosition = { kind: 'in_group', group_id: 'plugins', index: 0 } as const;

describe( 'customize draft-state', () => {
	describe( 'emptyDelta', () => {
		it( 'returns a fresh empty delta on every call', () => {
			const a = emptyDelta();
			const b = emptyDelta();
			expect( a ).toEqual( { version: 1, updated_at: 0, overrides: [] } );
			expect( a ).not.toBe( b );
		} );
	} );

	describe( 'cloneDelta', () => {
		it( 'deep-copies overrides so mutations on the clone do not leak back', () => {
			const src: LayoutDelta = {
				version: 1,
				updated_at: 100,
				overrides: [ { itemId: 'a', position: { ...samplePosition } } ],
			};
			const cloned = cloneDelta( src );
			cloned.overrides[ 0 ].position.index = 99;
			expect( src.overrides[ 0 ].position.index ).toBe( 0 );
		} );
	} );

	describe( 'deltasEqual', () => {
		it( 'returns true for structurally equal deltas', () => {
			const a: LayoutDelta = {
				version: 1,
				updated_at: 0,
				overrides: [ { itemId: 'a', position: { ...samplePosition } } ],
			};
			const b: LayoutDelta = {
				version: 1,
				updated_at: 0,
				overrides: [ { itemId: 'a', position: { ...samplePosition } } ],
			};
			expect( deltasEqual( a, b ) ).toBe( true );
		} );

		it( 'returns false when override count differs', () => {
			const a: LayoutDelta = { version: 1, updated_at: 0, overrides: [] };
			const b: LayoutDelta = {
				version: 1,
				updated_at: 0,
				overrides: [ { itemId: 'a', position: { ...samplePosition } } ],
			};
			expect( deltasEqual( a, b ) ).toBe( false );
		} );

		it( 'returns false when group_id differs in an in_group override', () => {
			const a: LayoutDelta = {
				version: 1,
				updated_at: 0,
				overrides: [
					{ itemId: 'a', position: { kind: 'in_group', group_id: 'plugins', index: 0 } },
				],
			};
			const b: LayoutDelta = {
				version: 1,
				updated_at: 0,
				overrides: [
					{ itemId: 'a', position: { kind: 'in_group', group_id: 'addons', index: 0 } },
				],
			};
			expect( deltasEqual( a, b ) ).toBe( false );
		} );
	} );

	describe( 'createDraftState', () => {
		it( 'bootstraps with an empty delta when none is supplied', () => {
			const state = createDraftState( null );
			expect( state.savedDelta.overrides ).toEqual( [] );
			expect( state.workingDelta.overrides ).toEqual( [] );
			expect( state.isDirty ).toBe( false );
		} );

		it( 'clones the supplied delta into both saved and working', () => {
			const saved: LayoutDelta = {
				version: 1,
				updated_at: 100,
				overrides: [ { itemId: 'a', position: { ...samplePosition } } ],
			};
			const state = createDraftState( saved );
			expect( state.savedDelta ).not.toBe( saved );
			expect( state.workingDelta ).not.toBe( saved );
			expect( state.workingDelta.overrides ).toEqual( saved.overrides );
		} );
	} );

	describe( 'moveItem', () => {
		it( 'adds an override and flips isDirty', () => {
			const state = createDraftState( null );
			const next = moveItem( state, 'a', samplePosition );
			expect( next.workingDelta.overrides ).toEqual( [
				{ itemId: 'a', position: samplePosition },
			] );
			expect( next.isDirty ).toBe( true );
		} );

		it( 'replaces an existing override for the same itemId', () => {
			const state = createDraftState( null );
			const a = moveItem( state, 'x', samplePosition );
			const b = moveItem( a, 'x', { kind: 'top_level', index: 5 } );
			expect( b.workingDelta.overrides.length ).toBe( 1 );
			expect( b.workingDelta.overrides[ 0 ].position ).toEqual( {
				kind: 'top_level',
				index: 5,
			} );
		} );

		it( 'moveItem -> resetItem sequence returns isDirty to false', () => {
			const state = createDraftState( null );
			const a = moveItem( state, 'x', samplePosition );
			expect( a.isDirty ).toBe( true );
			const b = resetItem( a, 'x' );
			expect( b.isDirty ).toBe( false );
		} );
	} );

	describe( 'recomputeDirty', () => {
		it( 'no-ops when the dirty flag already matches', () => {
			const state = createDraftState( null );
			const next = recomputeDirty( state );
			expect( next ).toBe( state );
		} );
	} );

	describe( 'cancel', () => {
		it( 'discards local changes — working matches saved again', () => {
			const state = createDraftState( null );
			const dirty = moveItem( state, 'x', samplePosition );
			expect( dirty.isDirty ).toBe( true );
			const cancelled = cancel( dirty );
			expect( cancelled.isDirty ).toBe( false );
			expect( cancelled.workingDelta.overrides ).toEqual( cancelled.savedDelta.overrides );
		} );
	} );

	describe( 'applySaved', () => {
		it( 'replaces saved + working with the new persisted delta', () => {
			const state = createDraftState( null );
			const dirty = moveItem( state, 'x', samplePosition );
			const saved: LayoutDelta = {
				version: 1,
				updated_at: 200,
				overrides: [ { itemId: 'y', position: { ...samplePosition } } ],
			};
			const next = applySaved( dirty, saved );
			expect( next.savedDelta.overrides[ 0 ].itemId ).toBe( 'y' );
			expect( next.workingDelta.overrides[ 0 ].itemId ).toBe( 'y' );
			expect( next.isDirty ).toBe( false );
			expect( next.isSaving ).toBe( false );
			expect( next.saveError ).toBeNull();
		} );
	} );

	describe( 'beginDrag / endDrag', () => {
		it( 'sets activeDrag on begin and clears on end', () => {
			const state = createDraftState( null );
			const dragging = beginDrag( state, 'x', samplePosition );
			expect( dragging.activeDrag ).toEqual( {
				itemId: 'x',
				sourcePosition: samplePosition,
			} );
			const ended = endDrag( dragging );
			expect( ended.activeDrag ).toBeNull();
		} );

		it( 'endDrag is a no-op when activeDrag is already null', () => {
			const state = createDraftState( null );
			const next = endDrag( state );
			expect( next ).toBe( state );
		} );
	} );
} );
