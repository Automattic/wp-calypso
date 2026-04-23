/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AtmosphereView from '../atmosphere-view';
import type React from 'react';

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

describe( 'AtmosphereView', () => {
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

	afterEach( () => nock.cleanAll() );

	it( 'renders the empty state ConnectForm with no tab bar when there are no connections', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/atmosphere/connections' ).reply( 200, { connections: [] } );

		renderWithProvider( <AtmosphereView />, { queryClient: makeClient() } );

		await waitFor( () => expect( screen.getByLabelText( /handle/i ) ).toBeVisible() );
		expect( screen.queryByRole( 'menuitem', { name: /timeline/i } ) ).not.toBeInTheDocument();
	} );

	it( 'renders the TimelinePanel when selectedTab is timeline', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connections: [
					{
						id: 101,
						handle: 'alice.bsky.social',
						display_name: 'Alice',
						did: 'did:plc:a',
						avatar: null,
					},
				],
			} );

		renderWithProvider( <AtmosphereView selectedTab="timeline" />, { queryClient: makeClient() } );

		await waitFor( () =>
			expect( screen.getByRole( 'menuitem', { name: /timeline/i } ) ).toBeVisible()
		);
		expect( screen.getByText( /still building this part/i ) ).toBeVisible();
	} );

	it( 'renders the ProfilePanel with the verified profile when selectedTab is profile', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connections: [
					{
						id: 101,
						handle: 'alice.bsky.social',
						display_name: 'Alice',
						did: 'did:plc:a',
						avatar: null,
					},
				],
			} );
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101' )
			.reply( 200, {
				did: 'did:plc:a',
				handle: 'alice.bsky.social',
				display_name: 'Alice',
				description: 'hi',
				avatar: null,
				banner: null,
				counts: { followers: 1, follows: 2, posts: 3 },
				raw: {},
			} );

		renderWithProvider( <AtmosphereView selectedTab="profile" />, { queryClient: makeClient() } );

		await waitFor( () => expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible() );
	} );

	it( 'renders the SettingsPanel ConnectForm when selectedTab is settings', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connections: [
					{
						id: 101,
						handle: 'alice.bsky.social',
						display_name: 'Alice',
						did: 'did:plc:a',
						avatar: null,
					},
				],
			} );

		renderWithProvider( <AtmosphereView selectedTab="settings" />, { queryClient: makeClient() } );

		await waitFor( () =>
			expect( screen.getByRole( 'menuitem', { name: /settings/i } ) ).toBeVisible()
		);
		expect( screen.getByLabelText( /handle/i ) ).toBeVisible();
		expect( screen.getByLabelText( /app password/i ) ).toBeVisible();
	} );
} );
