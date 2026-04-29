/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { PROFILE_TAB, TIMELINE_TAB } from '../helper';
import { MastodonAccountView } from '../mastodon-account-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

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
	} );
	afterEach( () => nock.cleanAll() );

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

	it( 'uses the display name from the details endpoint when the list omits it', async () => {
		// Regression: the list endpoint returns display_name as null for
		// Mastodon, so reading it directly made the header show the raw
		// webfinger handle as the title AND subtitle. The details endpoint is
		// authoritative for display name; the sidebar already lazy-fetches it,
		// the header has to as well.
		mockConnections( null );
		mockConnectionDetails( 7, 'Rocinante the Bold' );
		renderWithProvider( <MastodonAccountView connectionId={ 7 } tab={ TIMELINE_TAB } />, {
			queryClient: makeClient(),
		} );
		// The heading flashes to the handle before the details query resolves;
		// assert on the final state rather than the first findByRole match.
		await waitFor( () =>
			expect( screen.getByRole( 'heading', { level: 1 } ) ).toHaveTextContent(
				'Rocinante the Bold'
			)
		);
		expect( screen.getByRole( 'heading', { level: 1 } ) ).not.toHaveTextContent(
			'@alice@mastodon.social'
		);
	} );

	it( 'renders the profile tab when asked', async () => {
		mockConnections();
		mockConnectionDetails( 7 );
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
