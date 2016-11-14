import { assert } from 'chai';
import { createStore } from 'redux';

import { THEMES_RECEIVE } from 'state/action-types';
import reducer from '../reducer';

describe( 'themes', () => {
	const actionReceiveThemes = {
		type: THEMES_RECEIVE,
		themes: [
			{ id: 'bold-news' },
			{ id: 'picard' }
		]
	};
	const actionReceiveMoreThemes = {
		type: THEMES_RECEIVE,
		themes: [
			{ id: 'picard' },
			{ id: 'hue' }
		]
	};

	let store;

	beforeEach( () => {
		store = createStore( reducer );
	} );

	describe( 'get()', () => {
		beforeEach( () => {
			store.dispatch( actionReceiveThemes );
		} );

		it( 'returns all themes', () => {
			const themes = store.getState().get( 'themes' );
			assert( themes.size === 2, 'Wrong number of themes' );
		} );
	} );

	context( 'when THEMES_RECEIVE is received', () => {
		beforeEach( () => {
			store.dispatch( actionReceiveThemes );
		} );

		it( 'removes duplicates', () => {
			store.dispatch( actionReceiveMoreThemes );
			const themes = store.getState().get( 'themes' );
			assert( themes.size === 3, 'duplicates found' );
		} );
	} );
} );
