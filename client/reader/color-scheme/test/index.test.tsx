/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { PREFERENCE_KEY } from 'calypso/dashboard/app/color-scheme';
import ReaderColorScheme from '..';

const BODY_CLASS = 'is-reader-dark-mode';
const mockStore = configureStore();

function buildRemoteValues( { received, scheme }: { received: boolean; scheme?: unknown } ) {
	if ( ! received ) {
		return null;
	}
	return scheme === undefined ? {} : { [ PREFERENCE_KEY ]: scheme };
}

function buildState( {
	isLoggedIn = true,
	received = true,
	scheme,
}: {
	isLoggedIn?: boolean;
	received?: boolean;
	scheme?: unknown;
} = {} ) {
	return {
		currentUser: {
			id: isLoggedIn ? 123 : null,
			user: isLoggedIn ? { ID: 123 } : null,
		},
		preferences: {
			remoteValues: buildRemoteValues( { received, scheme } ),
			localValues: {},
			fetching: false,
			saving: false,
			lastFetchedTimestamp: null,
		},
	};
}

function renderWithStore( state = buildState() ) {
	return render( renderSubject( state ) );
}

function renderSubject( state = buildState() ) {
	const store = mockStore( state );

	return (
		<Provider store={ store }>
			<ReaderColorScheme>
				<span>child</span>
			</ReaderColorScheme>
		</Provider>
	);
}

describe( 'ReaderColorScheme', () => {
	beforeEach( () => {
		delete document.documentElement.dataset.theme;
		document.body.classList.remove( BODY_CLASS );
	} );

	test( 'renders children', () => {
		renderWithStore();

		expect( screen.getByText( 'child' ) ).toBeVisible();
	} );

	test( 'does not write data-theme or body class until remote preferences are received', () => {
		renderWithStore( buildState( { received: false } ) );

		expect( document.documentElement.dataset.theme ).toBeUndefined();
		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( false );
	} );

	test( 'applies the scheme after remote preferences arrive', () => {
		const { rerender } = render( renderSubject( buildState( { received: false } ) ) );

		rerender( renderSubject( buildState( { scheme: 'dark' } ) ) );

		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( true );
	} );

	test.each( [
		[ 'missing preference', undefined ],
		[ 'invalid preference', 'neon' ],
	] )( 'falls back to light for %s', ( _description, scheme ) => {
		renderWithStore( buildState( { scheme } ) );

		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( true );
	} );

	test.each( [ 'dark', 'system' ] )( 'applies the saved %s scheme', ( scheme ) => {
		renderWithStore( buildState( { scheme } ) );

		expect( document.documentElement.dataset.theme ).toBe( scheme );
		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( true );
	} );

	test( 'removes body class and data-theme on cleanup when there was no previous theme', () => {
		const { unmount } = renderWithStore( buildState( { scheme: 'dark' } ) );

		unmount();

		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( false );
		expect( document.documentElement.dataset.theme ).toBeUndefined();
	} );

	test( 'removes body class and restores previous data-theme on cleanup', () => {
		document.documentElement.dataset.theme = 'system';

		const { unmount } = renderWithStore( buildState( { scheme: 'dark' } ) );

		unmount();

		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( false );
		expect( document.documentElement.dataset.theme ).toBe( 'system' );
	} );

	test( 'cleans up when color-scheme support stops applying', () => {
		document.documentElement.dataset.theme = 'system';

		const { rerender } = render( renderSubject( buildState( { scheme: 'dark' } ) ) );

		rerender( renderSubject( buildState( { isLoggedIn: false, scheme: 'dark' } ) ) );

		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( false );
		expect( document.documentElement.dataset.theme ).toBe( 'system' );
	} );

	test( 'does nothing for logged-out users', () => {
		renderWithStore( buildState( { isLoggedIn: false, scheme: 'dark' } ) );

		expect( document.documentElement.dataset.theme ).toBeUndefined();
		expect( document.body.classList.contains( BODY_CLASS ) ).toBe( false );
	} );
} );
