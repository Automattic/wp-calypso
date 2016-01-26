import { assert } from 'chai';
import { createStore } from 'redux';

import ActionTypes from '../../action-types';
import reducer from '../reducer';

describe( 'themes-list', () => {
	const actionReceiveThemes = {
		type: ActionTypes.RECEIVE_THEMES,
		queryParams: {
			id: 1
		},
		themes: [
			{ id: 'bold-news', name: 'Bold News' },
			{ id: 'picard', name: 'Picard' },
			{ id: 'picard', name: 'Picard' }
		]
	};

	const actionReceiveMoreThemes = {
		type: ActionTypes.RECEIVE_THEMES,
		queryParams: {
			id: 1
		},
		themes: [
			{ id: 'picard', name: 'Picard' },
			{ id: 'hue', name: 'Hue' }
		]
	};

	const actionReceiveEvenMoreThemes = {
		type: ActionTypes.RECEIVE_THEMES,
		queryParams: {
			id: 2
		},
		themes: [
			{ id: '2014', name: 'Twenty Fourteen' },
			{ id: 'cheese', name: 'Cheese' }
		]
	};

	const actionQueryThemes = {
		type: ActionTypes.QUERY_THEMES,
		params: {
			search: 'picard',
			perPage: 50,
			page: 25
		}
	};

	const actionQueryAnotherTheme = {
		type: ActionTypes.QUERY_THEMES,
		params: {
			search: 'worf',
			perPage: 50,
			page: 25
		}
	};

	const actionIncrementPage = {
		type: ActionTypes.INCREMENT_THEMES_PAGE
	};

	let store;

	function getThemesList() {
		return store.getState().get( 'list' );
	}

	function getQueryParams() {
		return store.getState().get( 'query' ).toObject();
	}

	beforeEach( () => {
		store = createStore( reducer );
	} );

	describe( 'get()', () => {
		beforeEach( () => {
			store.dispatch( actionQueryThemes );
			store.dispatch( actionReceiveThemes );
		} );

		it( 'returns all themes', () => {
			const themes = getThemesList();
			assert( themes.length === 2, 'Wrong number of themes' );
		} );
	} );

	describe( 'query()', () => {
		beforeEach( () => {
			store.dispatch( actionQueryThemes );
		} );

		it( 'sets the query paramaters', () => {
			var params = getQueryParams();

			assert( params.search === 'picard', 'Wrong param' );
			assert( params.perPage === 50, 'Wrong param' );
			assert( params.page === 25, 'Wrong param' );
		} );
	} );

	describe( 'getQueryParams()', () => {
		context( 'when THEMES_INCREMENT_PAGE is received', () => {
			beforeEach( () => {
				store.dispatch( actionIncrementPage );
			} );

			it( 'increments the page number', () => {
				var params = getQueryParams();

				assert( params.page === 1 );
			} );
		} );
	} );

	context( 'when THEMES_RECEIVE is received', () => {
		beforeEach( () => {
			store.dispatch( actionQueryThemes );
			store.dispatch( actionReceiveThemes );
		} );

		it( 'removes duplicates', () => {
			store.dispatch( actionReceiveMoreThemes );

			assert( getThemesList().length === 3, 'incorrect number of themes' );
		} );
	} );

	context( 'when two THEMES_RECEIVE are received out of order', () => {
		beforeEach( () => {
			store.dispatch( actionQueryThemes ); // first query, query ID of 1
			store.dispatch( actionQueryAnotherTheme ); // second query, ID 2
			store.dispatch( actionReceiveEvenMoreThemes ); // receive themes from second query (ID 2)
			store.dispatch( actionReceiveThemes ); // receive themes from first query (ID 1)
		} );

		it( 'only takes into account the last query results', () => {
			assert( getThemesList().length === 2 );
			assert( getThemesList()[0] === '2014' );
		} );
	} );
} );
