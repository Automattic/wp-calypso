/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SiteHandoff } from '../site-handoff';
import type { Site } from '@automattic/api-core';

jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: '@@TEST/NOOP' } ),
} ) );

const ORIGIN = 'https://public-api.wordpress.com';

const trackingProps = {
	tracks: {
		editorOpened: ( siteId: number ) => ( {
			event: 'test_editor_opened',
			props: { site_id: siteId },
		} ),
		errorShown: ( siteId: number, errorKind: string ) => ( {
			event: 'test_error_shown',
			props: { site_id: siteId, error_kind: errorKind },
		} ),
	},
	caller: 'test_caller',
};

const siteA: Site = {
	ID: 100,
	name: 'My Blog',
	slug: 'myblog.wordpress.com',
	URL: 'https://myblog.wordpress.com',
	options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
	site_migration: { in_progress: false, is_complete: false },
} as Site;

afterEach( () => nock.cleanAll() );

describe( 'SiteHandoff — single site', () => {
	it( 'renders a static label and a submit button, no combobox', () => {
		renderWithProvider(
			<SiteHandoff
				sites={ [ siteA ] }
				content="<p>hi</p>"
				buttonLabel="Move to editor"
				{ ...trackingProps }
			/>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);
		expect( screen.getByText( /Publish on My Blog/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Move to editor/i } ) ).toBeVisible();
		expect( screen.queryByRole( 'combobox' ) ).toBeNull();
	} );
} );

describe( 'SiteHandoff — multi-site picker', () => {
	it( "renders a combobox with the user's sites and pre-selects the primary site", async () => {
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/settings/ )
			.reply( 200, { primary_site_ID: 200 } );

		const siteB = { ...siteA, ID: 200, name: 'Blog B', URL: 'https://b.wordpress.com' } as Site;

		renderWithProvider(
			<SiteHandoff
				sites={ [ siteA, siteB ] }
				content="<p>hi</p>"
				buttonLabel="Move to editor"
				{ ...trackingProps }
			/>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		const combobox = await screen.findByRole( 'combobox' );
		await waitFor( () => expect( ( combobox as HTMLInputElement ).value ).toContain( 'Blog B' ) );
	} );

	it( 'falls back to sites[0] when primary_site_ID is missing from the visible list', async () => {
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/settings/ )
			.reply( 200, { primary_site_ID: 999 } );

		const siteB = { ...siteA, ID: 200, name: 'Blog B', URL: 'https://b.wordpress.com' } as Site;

		renderWithProvider(
			<SiteHandoff
				sites={ [ siteA, siteB ] }
				content="<p>hi</p>"
				buttonLabel="Move to editor"
				{ ...trackingProps }
			/>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		const combobox = await screen.findByRole( 'combobox' );
		await waitFor( () => expect( ( combobox as HTMLInputElement ).value ).toContain( 'My Blog' ) );
	} );
} );

describe( 'SiteHandoff — click', () => {
	it( 'creates a draft and opens wp-admin on click', async () => {
		const user = userEvent.setup();
		const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.reply( 200, { ID: 555 } );

		renderWithProvider(
			<SiteHandoff
				sites={ [ siteA ] }
				content="<p>hi</p>"
				buttonLabel="Move to editor"
				{ ...trackingProps }
			/>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		await user.click( screen.getByRole( 'button', { name: /Move to editor/i } ) );

		await waitFor( () =>
			expect( openSpy ).toHaveBeenCalledWith(
				'https://myblog.wordpress.com/wp-admin/post.php?post=555&action=edit',
				'_blank',
				'noopener,noreferrer'
			)
		);

		openSpy.mockRestore();
	} );

	it( 'disables the combobox while saving', async () => {
		const user = userEvent.setup();
		const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/settings/ )
			.reply( 200, { primary_site_ID: 100 } );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.delay( 200 )
			.reply( 200, { ID: 9 } );

		const siteB = { ...siteA, ID: 200, name: 'Blog B', URL: 'https://b.wordpress.com' } as Site;

		renderWithProvider(
			<SiteHandoff
				sites={ [ siteA, siteB ] }
				content="<p>hi</p>"
				buttonLabel="Move to editor"
				{ ...trackingProps }
			/>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		const combobox = await screen.findByRole( 'combobox' );
		await user.click( screen.getByRole( 'button', { name: /Move to editor/i } ) );
		expect( combobox ).toBeDisabled();

		openSpy.mockRestore();
	} );
} );
