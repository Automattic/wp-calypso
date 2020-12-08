/**
 * External dependencies
 */
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import { isEditorSaveBlocked } from 'calypso/state/editor/selectors';
import { blockSave } from '../actions';
import saveBlockers from '../reducer';

const reducer = combineReducers( {
	editor: combineReducers( {
		saveBlockers,
	} ),
} );

describe( '#isSaveBlocked()', () => {
	let store;

	beforeEach( () => {
		store = createStore( reducer );
	} );

	test( 'returns false by default', () => {
		expect( isEditorSaveBlocked( store.getState() ) ).toBe( false );
	} );

	test( 'returns true if blocked and no key provided', () => {
		store.dispatch( blockSave( 'foo' ) );
		expect( isEditorSaveBlocked( store.getState() ) ).toBe( true );
	} );

	test( 'returns false if blocked but not by provided key', () => {
		store.dispatch( blockSave( 'foo' ) );
		expect( isEditorSaveBlocked( store.getState(), 'bar' ) ).toBe( false );
	} );

	test( 'returns true if blocked by provided key', () => {
		store.dispatch( blockSave( 'foo' ) );
		expect( isEditorSaveBlocked( store.getState(), 'foo' ) ).toBe( true );
	} );
} );
