/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
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

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '@automattic/calypso-router', () => {
	const mockPage: jest.Mock & { replace: jest.Mock } = Object.assign( jest.fn(), {
		replace: jest.fn(),
	} );
	return { __esModule: true, default: mockPage };
} );

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

beforeEach( () => {
	// recordReaderTracksEvent is a thunk that reads state.reader.follows.
	// Replace it with a no-op action creator so dispatch() doesn't throw,
	// while still letting spies observe call-site arguments.
	jest
		.spyOn( analytics, 'recordReaderTracksEvent' )
		.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
} );

afterEach( () => {
	nock.cleanAll();
	jest.restoreAllMocks();
	( page as unknown as jest.Mock ).mockClear();
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

	it( 'renders the back-to-timeline button above the panel', async () => {
		const user = userEvent.setup();
		// Force history.length === 1 so BackButton routes via page() instead of history.back().
		jest.spyOn( window.history, 'length', 'get' ).mockReturnValue( 1 );

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

		await screen.findByRole( 'heading', { level: 2, name: 'Alice' } );
		const backButtons = screen.getAllByRole( 'button', { name: /back/i } );
		expect( backButtons ).toHaveLength( 1 );
		await user.click( backButtons[ 0 ] );
		expect( page as unknown as jest.Mock ).toHaveBeenCalledWith( '/reader/atmosphere/42/timeline' );
		expect( analytics.recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_profile_back_to_timeline_clicked',
			{ connection_id: 42, actor: 'alice.bsky.social' }
		);
	} );
} );
