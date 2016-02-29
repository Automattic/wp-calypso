/**
 * External dependencies
 */
import { expect } from 'chai';
import { Map, fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import { RECEIVE_THEME_DETAILS } from '../../action-types';
import { DESERIALIZE, SERIALIZE, SERVER_DESERIALIZE } from '../../../action-types';
import reducer from '../reducer';
import deepFreeze from 'deep-freeze';

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
			themeAuthor: 'Automattic',
			themeScreenshot: 'mood.jpg',
			themePrice: '$20',
			themeDescription: 'the best theme ever invented',
			themeDescriptionLong: 'the plato form of a theme',
			themeSupportDocumentation: 'support comes from within',
		} );

		expect( state.get( 'mood' ).toJS() ).to.eql( {
			name: 'Mood',
			author: 'Automattic',
			screenshot: 'mood.jpg',
			price: '$20',
			description: 'the best theme ever invented',
			descriptionLong: 'the plato form of a theme',
			supportDocumentation: 'support comes from within',
		} );
	} );

	describe( 'persistence', () => {
		const initialState = Map();

		it( 'does not persist state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = fromJS( jsObject );
			const persistedState = reducer( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( {} );
		} );
		it( 'does not load persisted state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( Map() );
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

		it.skip( 'should ignore loading data with invalid keys ', () => {
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

		it.skip( 'should ignore loading data with invalid values ', () => {
			const jsObject = deepFreeze( {
				mood: 'foo'
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );
	} );
} );
