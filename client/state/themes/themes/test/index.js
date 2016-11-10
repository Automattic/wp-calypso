import { assert } from 'chai';
import { createStore } from 'redux';

import { THEME_ACTIVATE_REQUEST_SUCCESS, THEMES_RECEIVE } from 'state/action-types';
import reducer from '../reducer';

describe( 'themes', () => {
	const actionReceiveThemes = {
		type: THEMES_RECEIVE,
		themes: [
			{ id: 'bold-news', active: true },
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
	const actionThemeActivated = {
		type: THEME_ACTIVATE_REQUEST_SUCCESS,
		theme: { id: 'picard' }
	};

	let store;

	function getThemeById( id ) {
		const theme = store.getState().getIn( [ 'themes', id ] );
		return theme ? theme.toJS() : undefined;
	}

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

	context( 'when THEME_ACTIVATE_REQUEST_SUCCESS is received', () => {
		beforeEach( () => {
			store.dispatch( actionReceiveThemes );
		} );

		it( 'clears previous active flag', () => {
			assert.ok( getThemeById( 'bold-news' ).active, 'initial theme not active' );
			store.dispatch( actionThemeActivated );
			assert.notOk( getThemeById( 'bold-news' ).active, 'initial theme still active' );
			assert.ok( getThemeById( 'picard' ).active, 'new theme not active' );
		} );
	} );
} );
