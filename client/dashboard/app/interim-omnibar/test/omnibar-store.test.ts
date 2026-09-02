import { getSessionLocale, setSessionLocale } from '../../locale/session-locale';
import { createOmnibarStore } from '../omnibar-store';

type MinimalStore = {
	getState: () => { ui: { language: { localeSlug: string } } };
	dispatch: ( action: unknown ) => unknown;
};

describe( 'createOmnibarStore', () => {
	beforeEach( () => {
		setSessionLocale( null );
	} );

	it( 'seeds the locale slug so QuickLanguageSwitcher can read it', () => {
		const store = createOmnibarStore( { initialLocaleSlug: 'fr' } ) as MinimalStore;
		expect( store.getState().ui.language.localeSlug ).toBe( 'fr' );
	} );

	it( 'defaults the locale slug to en', () => {
		const store = createOmnibarStore() as MinimalStore;
		expect( store.getState().ui.language.localeSlug ).toBe( 'en' );
	} );

	it( 'runs thunks with dispatch and getState', () => {
		const store = createOmnibarStore() as MinimalStore;
		const thunk = jest.fn();
		store.dispatch( thunk );
		expect( thunk ).toHaveBeenCalledWith( store.dispatch, expect.any( Function ) );
	} );

	it( 'updates the language slice and the session locale on LOCALE_SET', () => {
		const store = createOmnibarStore() as MinimalStore;
		store.dispatch( { type: 'LOCALE_SET', localeSlug: 'de' } );
		expect( store.getState().ui.language.localeSlug ).toBe( 'de' );
		expect( getSessionLocale() ).toBe( 'de' );
	} );
} );
