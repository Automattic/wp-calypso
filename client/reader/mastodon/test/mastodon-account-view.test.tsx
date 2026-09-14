/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import * as readerAnalytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { NOTIFICATIONS_TAB, PROFILE_TAB, TIMELINE_TAB } from '../helper';
import { MastodonAccountView } from '../mastodon-account-view';
import type { MastodonAuthorProfile } from '@automattic/api-core';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => ( { title }: { title: string } ) => (
	<div data-testid="document-head-title">{ title }</div>
) );

jest.mock( '../timeline-panel', () => ( {
	TimelinePanel: () => <div>Mastodon timeline placeholder</div>,
} ) );

jest.mock( '@automattic/calypso-router', () => {
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const listUrl = '/wpcom/v2/reader/mastodon/connections';

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function mockConnections( displayName: string | null = 'Alice' ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( listUrl )
		.reply( 200, {
			connections: [
				{
					id: 7,
					handle: '@alice@mastodon.social',
					instance: 'mastodon.social',
					display_name: displayName,
					avatar: null,
				},
			],
		} );
}

function mockConnectionDetails( id: number, displayName: string = 'Alice' ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `${ listUrl }/${ id }` )
		.reply( 200, {
			handle: '@alice@mastodon.social',
			instance: 'mastodon.social',
			display_name: displayName,
			description: '',
			avatar: null,
			header: null,
			counts: { followers: 0, following: 0, posts: 0 },
			raw: {},
		} );
}

// `connection.handle` is `@alice@mastodon.social`; the query options
// normalize that to `alice@mastodon.social` (strip leading @, lowercase),
// then the fetcher URL-encodes it.
const ENCODED_ACTOR = 'alice%40mastodon.social';

function mockAuthorEndpoints( id: number, profile: Partial< MastodonAuthorProfile > = {} ): void {
	nock( 'https://public-api.wordpress.com' )
		.get( `${ listUrl }/${ id }/profile/${ ENCODED_ACTOR }` )
		.reply( 200, {
			id: String( id ),
			acct: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: null,
			header: null,
			note: '',
			counts: { followers: 0, following: 0, posts: 0 },
			locked: false,
			raw: {},
			...profile,
		} );
	nock( 'https://public-api.wordpress.com' )
		.get( `${ listUrl }/${ id }/profile/${ ENCODED_ACTOR }/feed` )
		.query( true )
		.reply( 200, { items: [], cursor: null } );
}

describe( 'MastodonAccountView', () => {
	// NavTabs (used by MastodonNavigation) relies on IntersectionObserver,
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
		// recordReaderTracksEvent is a thunk that reads the follows query cache;
		// the test store doesn't seed that slice. Replace with a no-op so
		// dispatch() doesn't throw when MastodonAuthorProfilePanel fires
		// `_profile_viewed` after the profile query resolves.
		jest
			.spyOn( readerAnalytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );
	afterEach( () => {
		nock.cleanAll();
		jest.restoreAllMocks();
	} );

	it( 'renders the timeline tab for a valid connection', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByRole( 'menuitem', { name: /Timeline/ } ) ).toBeVisible();
	} );

	it( 'redirects when connection id is not in the list', async () => {
		mockConnections();
		renderWithProvider( <MastodonAccountView connectionId={ 999 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon' ) );
	} );

	it( 'redirects invalid tab to /:id/timeline', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab="nope" />, {
			queryClient: makeClient(),
		} );
		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/mastodon/7/timeline' )
		);
	} );

	it( 'renders the section title and the handle-aware subtitle in the header', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByRole( 'heading', { name: /Mastodon/ } ) ).toBeVisible();
		expect( screen.getByTestId( 'mastodon-section-logo' ) ).toBeVisible();
		expect(
			screen.getByText(
				/Catch up with the latest from the people you follow on Mastodon with @alice@mastodon\.social/
			)
		).toBeVisible();
	} );

	it( 'still renders the section title when display_name is null on the list endpoint', async () => {
		// The list endpoint can omit display_name for Mastodon connections.
		// The section header is anchored on section identity, so the title
		// should remain "Mastodon" and the subtitle should keep showing the
		// handle without relying on the details endpoint.
		mockConnections( null );
		mockConnectionDetails( 7 );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByRole( 'heading', { name: /Mastodon/ } ) ).toBeVisible();
		expect(
			screen.getByText(
				/Catch up with the latest from the people you follow on Mastodon with @alice@mastodon\.social/
			)
		).toBeVisible();
	} );

	it( 'pulls the document title from the details endpoint when the list omits display_name', async () => {
		// Mastodon's list endpoint returns display_name: null. Without the
		// details fallback, the browser tab and bookmarks would silently
		// downgrade to the raw webfinger handle.
		mockConnections( null );
		mockConnectionDetails( 7, 'Alice the Brave' );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		await waitFor( () =>
			expect( screen.getByTestId( 'document-head-title' ) ).toHaveTextContent(
				'Alice the Brave ‹ Mastodon ‹ Reader'
			)
		);
	} );

	it( 'renders the notifications tab when asked', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		nock( 'https://public-api.wordpress.com' )
			.get( `${ listUrl }/7/notifications` )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ NOTIFICATIONS_TAB } />, {
			queryClient: makeClient(),
		} );
		expect( await screen.findByText( /no notifications yet/i ) ).toBeVisible();
	} );

	it( 'renders the profile tab when asked', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
		// ProfilePanel now renders MastodonAuthorProfilePanel for the
		// connected user, which fetches the author profile + feed.
		mockAuthorEndpoints( 7 );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ PROFILE_TAB } />, {
			queryClient: makeClient(),
		} );
		// Exact handle, not substring. A permissive `/@alice@mastodon\.social/`
		// would also match `@alice@mastodon.social@mastodon.social`, so an
		// accidental instance-doubling regression would go undetected.
		expect( await screen.findByText( '@alice@mastodon.social' ) ).toBeVisible();
		expect( screen.queryByText( /@mastodon\.social@mastodon\.social/ ) ).not.toBeInTheDocument();
	} );
} );
