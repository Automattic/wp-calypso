/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { AuthorProfileView } from '../author-profile-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );

// NavTabs (used by AuthorProfileTabs inside AuthorProfilePanel) relies on
// IntersectionObserver, which jsdom does not provide.
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

afterEach( () => {
	nock.cleanAll();
	jest.restoreAllMocks();
	( page.replace as jest.Mock ).mockClear();
} );

describe( 'AuthorProfileView', () => {
	it( 'shows a loading status while connections are pending', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.delay( 5000 )
			.reply( 200, { connections: [] } );

		renderWithProvider( <AuthorProfileView connectionId={ 42 } actor="alice.bsky.social" /> );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( /loading/i );
	} );

	it( 'redirects to /reader/atmosphere when the connection is missing', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, { connections: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, {} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <AuthorProfileView connectionId={ 42 } actor="alice.bsky.social" /> );

		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere' ) );
	} );

	it( 'renders AuthorProfilePanel when the connection resolves', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connections: [
					{
						id: 42,
						did: 'did:plc:viewer',
						handle: 'viewer.bsky.social',
						display_name: 'Viewer',
						avatar: null,
					},
				],
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
			.reply( 200, {
				did: 'did:plc:abc',
				handle: 'alice.bsky.social',
				display_name: 'Alice',
				description: '',
				description_html: '',
				avatar: null,
				banner: null,
				bluesky_url: 'https://bsky.app/profile/alice.bsky.social',
				counts: { followers: 0, follows: 0, posts: 0 },
				viewer: { following: null, following_rkey: null, followed_by: false },
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed' )
			.reply( 200, { items: [], cursor: null } );

		renderWithProvider( <AuthorProfileView connectionId={ 42 } actor="alice.bsky.social" /> );

		expect( await screen.findByRole( 'heading', { level: 2, name: 'Alice' } ) ).toBeVisible();
	} );
} );
