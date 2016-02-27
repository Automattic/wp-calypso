/**
 * External dependencies
 */
import { expect } from 'chai';
import { Map, fromJS } from 'immutable';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { RECEIVE_THEME_DETAILS } from '../../action-types';
import { DESERIALIZE, SERIALIZE, SERVER_DESERIALIZE } from '../../../action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should default to an empty Immutable Map', () => {
		const state = reducer( undefined, {} );

		expect( state.toJS() ).to.be.empty;
	} );

	it( 'should set theme details for the given ID', () => {
		const state = reducer( undefined, {
			type: RECEIVE_THEME_DETAILS,
			themeId: 'mood',
			themeName: 'Mood',
			themeAuthor: 'Automattic'
		} );

		expect( state.get( 'mood' ).toJS() ).to.eql( {
			name: 'Mood',
			author: 'Automattic'
		} );
	} );

	describe( 'persistence', () => {
		before( () => {
			sinon.stub( console, 'warn' );
		} );
		after( () => {
			console.warn.restore();
		} );
		const initialState = Map();
		it( 'persists state and converts to a plain JS object', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = fromJS( jsObject );
			const persistedState = reducer( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( jsObject );
		} );
		it( 'loads valid persisted state and converts to immutable.js object', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );

		it( 'converts state from server to immutable.js object', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = reducer( jsObject, { type: SERVER_DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );

		it( 'should ignore loading data with invalid keys ', () => {
			const jsObject = deepFreeze( {
				missingKey: true,
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );

		it( 'should ignore loading data with invalid values ', () => {
			const jsObject = deepFreeze( {
				mood: 'foo'
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );
	} );
} );
