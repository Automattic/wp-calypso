/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SettingsPanel } from '../settings-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );

function makeClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: 0 } },
	} );
}

function connection( overrides: Partial< AtmosphereConnection > = {} ): AtmosphereConnection {
	return {
		id: 101,
		did: 'did:plc:a',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		avatar: null,
		publicize_site_count: 0,
		...overrides,
	};
}

describe( 'SettingsPanel', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders a Disconnect button labelled with the handle', () => {
		renderWithProvider( <SettingsPanel connection={ connection() } />, {
			queryClient: makeClient(),
		} );
		expect(
			screen.getByRole( 'button', { name: /disconnect @alice\.bsky\.social/i } )
		).toBeVisible();
	} );

	it( 'opens a confirmation modal scoped to the connection', async () => {
		const user = userEvent.setup();
		renderWithProvider( <SettingsPanel connection={ connection() } />, {
			queryClient: makeClient(),
		} );
		await user.click( screen.getByRole( 'button', { name: /disconnect @alice/i } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( within( dialog ).getByText( /alice\.bsky\.social/ ) ).toBeVisible();
	} );

	it( 'shows no Publicize warning when publicize_site_count is 0', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<SettingsPanel connection={ connection( { publicize_site_count: 0 } ) } />,
			{ queryClient: makeClient() }
		);
		await user.click( screen.getByRole( 'button', { name: /disconnect @alice/i } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( within( dialog ).queryByText( /jetpack social/i ) ).not.toBeInTheDocument();
	} );

	it( 'shows singular Publicize warning when publicize_site_count is 1', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<SettingsPanel connection={ connection( { publicize_site_count: 1 } ) } />,
			{ queryClient: makeClient() }
		);
		await user.click( screen.getByRole( 'button', { name: /disconnect @alice/i } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( within( dialog ).getByText( /1 site/ ) ).toBeVisible();
	} );

	it( 'shows plural Publicize warning when publicize_site_count > 1', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<SettingsPanel connection={ connection( { publicize_site_count: 5 } ) } />,
			{ queryClient: makeClient() }
		);
		await user.click( screen.getByRole( 'button', { name: /disconnect @alice/i } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( within( dialog ).getByText( /5 sites/ ) ).toBeVisible();
	} );

	it( 'closes the modal without calling the mutation when Cancel is clicked', async () => {
		const user = userEvent.setup();
		const scope = nock( BASE )
			.delete( '/wpcom/v2/reader/atmosphere/connections/101' )
			.reply( 200, {} );

		renderWithProvider( <SettingsPanel connection={ connection() } />, {
			queryClient: makeClient(),
		} );

		await user.click( screen.getByRole( 'button', { name: /disconnect @alice/i } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: /cancel/i } ) );

		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
		expect( scope.isDone() ).toBe( false );
	} );

	it( 'fires the mutation with the connection id and redirects on success', async () => {
		const user = userEvent.setup();
		const page = ( await import( '@automattic/calypso-router' ) ).default as unknown as {
			replace: jest.Mock;
		};
		page.replace.mockClear();
		const scope = nock( BASE )
			.delete( '/wpcom/v2/reader/atmosphere/connections/101' )
			.reply( 200, {} );

		renderWithProvider( <SettingsPanel connection={ connection( { id: 101 } ) } />, {
			queryClient: makeClient(),
		} );

		await user.click( screen.getByRole( 'button', { name: /disconnect @alice/i } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: /^disconnect$/i } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( page.replace ).toHaveBeenCalledWith( '/reader/atmosphere' ) );
	} );

	it( 'renders typed error copy when the mutation fails with upstream_unavailable', async () => {
		const user = userEvent.setup();
		nock( BASE ).delete( '/wpcom/v2/reader/atmosphere/connections/101' ).reply( 502, {
			error: 'upstream_unavailable',
			message: '',
			statusCode: 502,
			status: 502,
		} );

		renderWithProvider( <SettingsPanel connection={ connection( { id: 101 } ) } />, {
			queryClient: makeClient(),
		} );

		await user.click( screen.getByRole( 'button', { name: /disconnect @alice/i } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: /^disconnect$/i } ) );

		expect( await within( dialog ).findByText( /Bluesky is unreachable/i ) ).toBeVisible();
	} );
} );
