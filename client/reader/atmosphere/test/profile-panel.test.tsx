/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ProfilePanel } from '../profile-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

const connection: AtmosphereConnection = {
	id: 42,
	did: 'did:plc:viewer',
	handle: 'viewer.bsky.social',
	display_name: 'Viewer',
	avatar: null,
};

function makeQueryClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

afterEach( () => {
	nock.cleanAll();
} );

describe( 'ProfilePanel (own profile)', () => {
	it( 'shows a loading status while the connection details are pending', () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42' )
			.delay( 5000 )
			.reply( 200, {} );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( /loading/i );
	} );

	it( 'renders the rich SocialProfileCard once the data resolves', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42' )
			.reply( 200, {
				did: 'did:plc:viewer',
				handle: 'viewer.bsky.social',
				display_name: 'Viewer Name',
				description: 'About me.',
				avatar: 'https://cdn.example/a.jpg',
				banner: 'https://cdn.example/b.jpg',
				counts: { followers: 12, follows: 7, posts: 4 },
			} );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		expect( await screen.findByRole( 'heading', { level: 2, name: 'Viewer Name' } ) ).toBeVisible();
		expect( screen.getByText( '@viewer.bsky.social' ) ).toBeVisible();
		expect( screen.getByText( 'About me.' ) ).toBeVisible();
	} );

	it( 'renders an error state when the connection endpoint fails', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/reader/atmosphere/connections/42' )
			.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

		renderWithProvider( <ProfilePanel connection={ connection } />, {
			queryClient: makeQueryClient(),
		} );

		expect( await screen.findByText( /Bluesky is unreachable right now\./i ) ).toBeVisible();
	} );
} );
