import { registerCoreBlocks } from '@wordpress/block-library';
import reducer from '../reducer';

beforeAll( () => {
	registerCoreBlocks();
} );

describe( 'isolated/editor store', () => {
	describe( 'reducer', () => {
		it( 'editor becomes ready', () => {
			const state = reducer( { isReady: false }, { type: 'SET_EDITOR_READY', isReady: true } );

			expect( state.isReady ).toBe( true );
		} );

		it( 'inspector is closed when focus is set', () => {
			const state = reducer( { isInspecting: true }, { type: 'SET_EDITING', isEditing: true } );

			expect( state.isInspecting ).toBe( false );
		} );

		it( 'inspector is closed when focus is lost', () => {
			const state = reducer( { isInspecting: true }, { type: 'SET_EDITING', isEditing: false } );

			expect( state.isInspecting ).toBe( false );
		} );

		it( 'inserter is closed when inspector is opened', () => {
			const state = reducer(
				{ isInserterOpened: true },
				{ type: 'SET_INSPECTOR_OPEN', isOpen: true }
			);

			expect( state ).toEqual( { isInspecting: true, isInserterOpened: false } );
		} );

		it( 'inserter is closed when inspector is closed', () => {
			const state = reducer(
				{ isInserterOpened: true },
				{ type: 'SET_INSPECTOR_OPEN', isOpen: false }
			);

			expect( state ).toEqual( { isInspecting: false, isInserterOpened: false } );
		} );

		it( 'inspector is closed when inserter is opened', () => {
			const state = reducer( { isInspecting: true }, { type: 'SET_INSERTER_OPEN', isOpen: true } );

			expect( state ).toEqual( { isInspecting: false, isInserterOpened: true } );
		} );

		it( 'inspector is closed when inserter is closed', () => {
			const state = reducer( { isInspecting: true }, { type: 'SET_INSERTER_OPEN', isOpen: false } );

			expect( state ).toEqual( { isInspecting: false, isInserterOpened: false } );
		} );
	} );
} );
