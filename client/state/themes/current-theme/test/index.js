import { expect } from 'chai';
import { createStore } from 'redux';

import { THEME_RECEIVE_CURRENT } from 'state/action-types';
import reducer from '../reducer';

describe( 'current-theme', () => {
	const SITE = { ID: 77203074 }; // dummy id

	const actionReceiveCurrentTheme = {
		type: THEME_RECEIVE_CURRENT,
		themeId: 'twentyfifteen',
		themeName: 'Twenty Fifteen',
		siteId: SITE.ID,
	};

	let store;

	function getCurrentTheme( siteId ) {
		return store.getState().get( 'currentThemes' ).get( siteId );
	}

	beforeEach( () => {
		store = createStore( reducer );
	} );

	describe( 'get()', () => {
		beforeEach( () => {
			store.dispatch( actionReceiveCurrentTheme );
		} );

		it( 'returns the current theme for the supplied site id', () => {
			const currentTheme = getCurrentTheme( SITE.ID );

			expect( currentTheme.id ).to.equal( 'twentyfifteen' );
			expect( currentTheme.name ).to.equal( 'Twenty Fifteen' );
		} );
	} );
} );
