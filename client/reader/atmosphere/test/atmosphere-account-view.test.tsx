/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AtmosphereAccountView } from '../atmosphere-account-view';
import { NOTIFICATIONS_TAB, PROFILE_TAB, TIMELINE_TAB } from '../helper';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

// recordReaderTracksEvent is a thunk that reads the follows query cache. The test
// store from renderWithProvider does not provide that slice. Replace it with a
// no-op action creator so dispatch() does not throw.
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const listUrl = '/wpcom/v2/reader/atmosphere/connections';

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function mockConnections() {
	return nock( 'https://public-api.wordpress.com' )
		.get( listUrl )
		.reply( 200, {
			connections: [
				{
					id: 7,
					did: 'did:plc:7',
					handle: 'a.bsky.social',
					display_name: 'Alice',
					avatar: null,
				},
			],
		} );
}

function mockConnectionDetails( id: number ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `${ listUrl }/${ id }` )
		.reply( 200, {
			did: `did:plc:${ id }`,
			handle: 'a.bsky.social',
			display_name: 'Alice',
			description: '',
			avatar: null,
			banner: null,
			counts: { followers: 0, follows: 0, posts: 0 },
		} );
}

describe( 'AtmosphereAccountView', () => {
	// NavTabs (used by AtmosphereNavigation) relies on IntersectionObserver,
	// which jsdom does not provide.
	beforeAll( () => {
		global.IntersectionObserver = class IntersectionObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof global.IntersectionObserver;
	} );

	afterAll( () => {
		// @ts-expect-error -- cleaning up the stub
		delete global.IntersectionObserver;
	} );

	beforeEach( () => {
		( page as unknown as jest.Mock ).mockClear();
		( page.replace as jest.Mock ).mockClear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'renders the timeline tab for a valid connection', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByRole( 'menuitem', { name: /Timeline/ } ) ).toBeVisible();
	} );

	it( 'redirects when connection id is not in the list', async () => {
		mockConnections();
		renderWithProvider( <AtmosphereAccountView connectionId={ 999 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere' ) );
	} );

	it( 'redirects invalid tab to /:id/timeline', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab="nope" />, {
			queryClient: makeClient(),
		} );
		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere/7/timeline' )
		);
	} );

	it( 'renders the profile tab when asked', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ PROFILE_TAB } />, {
			queryClient: makeClient(),
		} );
		const matches = await screen.findAllByText( /a\.bsky\.social/ );
		expect( matches.length ).toBeGreaterThan( 0 );
		matches.forEach( ( match ) => expect( match ).toBeVisible() );
	} );

	it( 'renders the notifications tab when asked', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		nock( 'https://public-api.wordpress.com' )
			.get( `${ listUrl }/7/notifications` )
			.query( true )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ NOTIFICATIONS_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByText( /no notifications yet/i ) ).toBeVisible();
	} );

	it( 'renders the section title and the handle-aware subtitle in the header', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		renderWithProvider( <AtmosphereAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByRole( 'heading', { name: /ATmosphere/ } ) ).toBeVisible();
		expect( screen.getByTestId( 'atmosphere-section-logo' ) ).toBeVisible();
		expect(
			screen.getByText(
				/Catch up with the latest from the people you follow on Bluesky with @a\.bsky\.social/
			)
		).toBeVisible();
	} );
} );
