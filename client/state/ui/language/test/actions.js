import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { LOCALE_SET } from 'calypso/state/action-types';
import { setLocale } from '../actions';

describe( 'actions', () => {
	describe( 'setLocale', () => {
		const middlewares = [ thunk ];
		const mockStore = configureStore( middlewares );
		test( 'dispatches an appropriate action', async () => {
			const store = mockStore();
			await store.dispatch( setLocale( 'he' ) );
			const actions = store.getActions();
			expect( actions[ 0 ] ).toEqual( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: null,
			} );
		} );

		test( 'dispatches an action with localeVariant set', async () => {
			const store = mockStore();
			await store.dispatch( setLocale( 'he', 'he_formal' ) );
			const actions = store.getActions();
			expect( actions[ 0 ] ).toEqual( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: 'he_formal',
			} );
		} );
	} );
} );
