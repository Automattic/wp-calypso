import { expect } from 'chai';
import { createStore } from 'redux';

import ActionTypes from '../../action-types';
import reducer from '../reducer';

describe( 'current-theme', () => {
	const SITE = { ID: 77203074 }; // dummy id

	const actionReceiveCurrentTheme = {
		type: ActionTypes.RECEIVE_CURRENT_THEME,
		themeId: 'twentyfifteen',
		themeName: 'Twenty Fifteen',
		site: SITE
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
