/**
 * @jest-environment jsdom
 */
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonLandingView } from '../mastodon-landing-view';
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
	const replace = jest.fn();
	const fn = jest.fn() as jest.Mock & { replace: jest.Mock };
	fn.replace = replace;
	return { __esModule: true, default: fn };
} );

const BASE = 'https://public-api.wordpress.com';

describe( 'MastodonLandingView reauth tag', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders the "Needs reconnect" tag next to a connection that needs_reauth', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections' )
			.reply( 200, {
				connections: [
					{
						id: 42,
						handle: '@jeherve@a8c.social',
						instance: 'a8c.social',
						display_name: 'Jeremy',
						avatar: null,
					},
				],
			} );
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/auth-status' )
			.reply( 200, { needs_reauth: true } );

		const { findByText } = renderWithProvider( <MastodonLandingView /> );
		expect( await findByText( 'Needs reconnect' ) ).toBeVisible();
	} );

	it( 'does not render the tag for healthy connections', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections' )
			.reply( 200, {
				connections: [
					{
						id: 42,
						handle: '@jeherve@a8c.social',
						instance: 'a8c.social',
						display_name: 'Jeremy',
						avatar: null,
					},
				],
			} );
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/auth-status' )
			.reply( 200, { needs_reauth: false } );

		const { findByText, queryByText } = renderWithProvider( <MastodonLandingView /> );
		await findByText( /jeherve@a8c\.social/i );
		expect( queryByText( 'Needs reconnect' ) ).not.toBeInTheDocument();
	} );
} );
