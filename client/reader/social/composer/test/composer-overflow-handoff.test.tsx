/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useEffect } from 'react';
import * as notices from 'calypso/state/notices/actions';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ComposerOverflowHandoff } from '../composer-overflow-handoff';
import { ComposerProvider, useComposer } from '../composer-provider';
import { testComposerConfig } from '../test-config';
import type { ComposerConfig } from '../composer-config';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );

const ORIGIN = 'https://public-api.wordpress.com';

function renderWithComposer(
	ui: ReactNode,
	{
		withMode = false,
		config = testComposerConfig,
	}: {
		withMode?: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		config?: ComposerConfig< any, any, any >;
	} = {}
) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );

	function Inner() {
		const composer = useComposer();
		useEffect( () => {
			if ( withMode && ! composer.mode ) {
				composer.openComposer( { kind: 'standalone', entry_point: 'fab' } );
			}
			// Only run on mount; subsequent re-renders are not the trigger we want.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );
		return <>{ ui }</>;
	}

	return renderWithProvider(
		<ComposerProvider connectionId={ 1 } config={ config }>
			<Inner />
		</ComposerProvider>,
		{ queryClient }
	);
}

function mockSitesQuery( sites: Partial< Site >[] ) {
	nock( ORIGIN )
		.get( /\/rest\/v1\.\d+\/me\/sites/ )
		.reply( 200, { sites } );
}

afterEach( () => nock.cleanAll() );

describe( 'ComposerOverflowHandoff — gate', () => {
	it( 'renders nothing when hasBeenOverLimit is false', () => {
		renderWithComposer( <ComposerOverflowHandoff text="hello" /> );
		expect( screen.queryByRole( 'region', { name: /publish on your own site/i } ) ).toBeNull();
	} );
} );

describe( 'ComposerOverflowHandoff — null branches', () => {
	it( 'renders nothing when sites query resolves to []', async () => {
		mockSitesQuery( [] );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="hi" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		// Wait a tick for the query to resolve, then assert nothing rendered.
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		expect( screen.queryByRole( 'region', { name: /publish on your own site/i } ) ).toBeNull();
	} );
} );

describe( 'ComposerOverflowHandoff — protocol label in copy', () => {
	it( 'interpolates config.protocolLabel into the section description', async () => {
		mockSitesQuery( [
			{
				ID: 100,
				name: 'My Blog',
				slug: 'myblog.wordpress.com',
				URL: 'https://myblog.wordpress.com',
				options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
			} as Partial< Site >,
		] );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="hi" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		expect( await screen.findByText( /Too long for TestProtocol\?/i ) ).toBeVisible();
	} );
} );

describe( 'ComposerOverflowHandoff — single site', () => {
	it( 'shows a static label and primary button when the user has exactly one site', async () => {
		mockSitesQuery( [
			{
				ID: 100,
				name: 'My Blog',
				slug: 'myblog.wordpress.com',
				URL: 'https://myblog.wordpress.com',
				options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
			} as Partial< Site >,
		] );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="hi" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		expect( await screen.findByText( /Publish on My Blog/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Move to editor/i } ) ).toBeVisible();
		expect( screen.queryByRole( 'combobox' ) ).toBeNull();
	} );
} );

describe( 'ComposerOverflowHandoff — multi-site picker', () => {
	it( "renders a combobox with the user's sites and pre-selects the primary site", async () => {
		mockSitesQuery( [
			{
				ID: 100,
				name: 'Blog A',
				slug: 'a.wordpress.com',
				URL: 'https://a.wordpress.com',
				options: { admin_url: 'https://a.wordpress.com/wp-admin/' },
				site_migration: { in_progress: false, is_complete: false },
			} as Partial< Site >,
			{
				ID: 200,
				name: 'Blog B',
				slug: 'b.wordpress.com',
				URL: 'https://b.wordpress.com',
				options: { admin_url: 'https://b.wordpress.com/wp-admin/' },
				site_migration: { in_progress: false, is_complete: false },
			} as Partial< Site >,
		] );

		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/settings/ )
			.reply( 200, { primary_site_ID: 200 } );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="hi" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		const combobox = await screen.findByRole( 'combobox' );
		expect( combobox ).toBeVisible();
		// `Blog B` is the primary site, so it should be the default value.
		await waitFor( () => expect( ( combobox as HTMLInputElement ).value ).toContain( 'Blog B' ) );
	} );

	it( 'falls back to sites[0] when primary_site_ID is set but missing from the sites list', async () => {
		mockSitesQuery( [
			{
				ID: 100,
				name: 'Blog A',
				slug: 'a.wordpress.com',
				URL: 'https://a.wordpress.com',
				options: { admin_url: 'https://a.wordpress.com/wp-admin/' },
				site_migration: { in_progress: false, is_complete: false },
			} as Partial< Site >,
			{
				ID: 200,
				name: 'Blog B',
				slug: 'b.wordpress.com',
				URL: 'https://b.wordpress.com',
				options: { admin_url: 'https://b.wordpress.com/wp-admin/' },
				site_migration: { in_progress: false, is_complete: false },
			} as Partial< Site >,
		] );

		// `primary_site_ID` is set to a site that's NOT in the visible
		// list (e.g. user's primary site is excluded by the `sitesQuery`
		// filter). The picker must fall back to `sites[0]` rather than
		// pre-selecting a non-existent site.
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/settings/ )
			.reply( 200, { primary_site_ID: 999 } );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="hi" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		const combobox = await screen.findByRole( 'combobox' );
		await waitFor( () => expect( ( combobox as HTMLInputElement ).value ).toContain( 'Blog A' ) );
	} );
} );

describe( 'ComposerOverflowHandoff — Move to editor click', () => {
	let openSpy: jest.SpyInstance;
	let fakeWindow: { location: { href: string }; close: jest.Mock };

	beforeEach( () => {
		fakeWindow = { location: { href: '' }, close: jest.fn() };
		openSpy = jest
			.spyOn( window, 'open' )
			.mockImplementation( () => fakeWindow as unknown as Window );
	} );

	afterEach( () => {
		openSpy.mockRestore();
	} );

	it( 'pre-opens a tab synchronously and redirects it to wp-admin on success', async () => {
		const user = userEvent.setup();
		mockSitesQuery( [
			{
				ID: 100,
				name: 'My Blog',
				slug: 'myblog.wordpress.com',
				URL: 'https://myblog.wordpress.com',
				site_migration: { in_progress: false, is_complete: false },
				options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
			} as Partial< Site >,
		] );

		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.reply( 200, { ID: 555, site_ID: 100, URL: 'https://myblog.wordpress.com/?p=555' } );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="my long draft" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		const button = await screen.findByRole( 'button', { name: /Move to editor/i } );
		await user.click( button );

		expect( openSpy ).toHaveBeenCalledWith( 'about:blank', '_blank' );
		await waitFor( () =>
			expect( fakeWindow.location.href ).toBe(
				'https://myblog.wordpress.com/wp-admin/post.php?post=555&action=edit'
			)
		);
	} );

	it( 'dispatches a fallback success notice with an Open-in-editor button when window.open is blocked', async () => {
		const user = userEvent.setup();
		// Re-mock window.open to return null for this test only (popup-blocker
		// case). The default fakeWindow mock from beforeEach is replaced.
		openSpy.mockImplementation( () => null );
		const successNoticeSpy = jest.spyOn( notices, 'successNotice' );
		mockSitesQuery( [
			{
				ID: 100,
				name: 'My Blog',
				slug: 'myblog.wordpress.com',
				URL: 'https://myblog.wordpress.com',
				site_migration: { in_progress: false, is_complete: false },
				options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
			} as Partial< Site >,
		] );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.reply( 200, { ID: 555, site_ID: 100, URL: 'https://myblog.wordpress.com/?p=555' } );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="my long draft" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		const button = await screen.findByRole( 'button', { name: /Move to editor/i } );
		await user.click( button );

		// `openSpy` is mocked to return null (popup-blocker case). The
		// fallback path dispatches a success notice with an "Open in editor"
		// button whose onClick retries window.open from a fresh gesture.
		await waitFor( () =>
			expect( successNoticeSpy ).toHaveBeenCalledWith(
				expect.stringMatching( /draft saved/i ),
				expect.objectContaining( {
					button: expect.stringMatching( /open in editor/i ),
					onClick: expect.any( Function ),
				} )
			)
		);
		const noticeOptions = successNoticeSpy.mock.calls[ 0 ][ 1 ] as {
			onClick: () => void;
		};
		noticeOptions.onClick();
		expect( openSpy ).toHaveBeenLastCalledWith(
			'https://myblog.wordpress.com/wp-admin/post.php?post=555&action=edit',
			'_blank',
			'noopener,noreferrer'
		);
		successNoticeSpy.mockRestore();
	} );

	it( 'derives the editor URL from site.URL when admin_url is missing', async () => {
		const user = userEvent.setup();
		mockSitesQuery( [
			{
				ID: 100,
				name: 'My Blog',
				slug: 'myblog.wordpress.com',
				URL: 'https://myblog.wordpress.com/',
				site_migration: { in_progress: false, is_complete: false },
				options: undefined,
			} as Partial< Site >,
		] );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.reply( 200, { ID: 555 } );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="my long draft" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		const button = await screen.findByRole( 'button', { name: /Move to editor/i } );
		await user.click( button );

		// `site.URL` carries a trailing slash; the fallback strips it
		// before appending `/wp-admin/post.php` so we don't end up with
		// `//wp-admin/`.
		await waitFor( () =>
			expect( fakeWindow.location.href ).toBe(
				'https://myblog.wordpress.com/wp-admin/post.php?post=555&action=edit'
			)
		);
	} );

	it( 'fires an error notice and does not redirect on mutation failure', async () => {
		const user = userEvent.setup();
		mockSitesQuery( [
			{
				ID: 100,
				name: 'My Blog',
				slug: 'myblog.wordpress.com',
				URL: 'https://myblog.wordpress.com',
				site_migration: { in_progress: false, is_complete: false },
				options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
			} as Partial< Site >,
		] );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.reply( 500, { error: 'oops' } );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="my long draft" />
			</>,
			{ withMode: true }
		);

		act( () => composer!.markOverLimit() );

		const button = await screen.findByRole( 'button', { name: /Move to editor/i } );
		await user.click( button );

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		await waitFor( () => expect( fakeWindow.close ).toHaveBeenCalled() );
		expect( fakeWindow.location.href ).toBe( '' );
	} );
} );

describe( 'ComposerOverflowHandoff — Tracks events', () => {
	const trackingConfig: typeof testComposerConfig = {
		...testComposerConfig,
		overflowHandoff: {
			shown: ( mode ) => ( {
				event: 'test_composer_overflow_handoff_shown',
				props: { connection_id: mode.connectionId, mode_kind: mode.kind },
			} ),
			editorOpened: ( mode, { siteId } ) => ( {
				event: 'test_composer_overflow_handoff_editor_opened',
				props: { connection_id: mode.connectionId, mode_kind: mode.kind, site_id: siteId },
			} ),
		},
	};

	let recordSpy: jest.SpyInstance;

	beforeEach( () => {
		recordSpy = jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );

	afterEach( () => {
		recordSpy.mockRestore();
	} );

	it( 'fires overflowHandoff.shown once when the section first renders', async () => {
		mockSitesQuery( [
			{
				ID: 100,
				name: 'My Blog',
				slug: 'myblog.wordpress.com',
				URL: 'https://myblog.wordpress.com',
				options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
			} as Partial< Site >,
		] );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		renderWithComposer(
			<>
				<Probe />
				<ComposerOverflowHandoff text="hi" />
			</>,
			{ withMode: true, config: trackingConfig }
		);

		act( () => composer!.markOverLimit() );

		await screen.findByRole( 'button', { name: /Move to editor/i } );

		const shownCalls = recordSpy.mock.calls.filter(
			( call ) => call[ 0 ] === 'test_composer_overflow_handoff_shown'
		);
		expect( shownCalls ).toHaveLength( 1 );
		expect( shownCalls[ 0 ][ 1 ] ).toEqual( { connection_id: 1, mode_kind: 'standalone' } );
	} );

	it( 'fires overflowHandoff.editorOpened with the chosen site_id on Move to editor click', async () => {
		const user = userEvent.setup();
		const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );

		try {
			mockSitesQuery( [
				{
					ID: 100,
					name: 'My Blog',
					slug: 'myblog.wordpress.com',
					URL: 'https://myblog.wordpress.com',
					site_migration: { in_progress: false, is_complete: false },
					options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
				} as Partial< Site >,
			] );

			nock( ORIGIN )
				.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
				.reply( 200, { ID: 555, site_ID: 100, URL: 'https://myblog.wordpress.com/?p=555' } );

			let composer: ReturnType< typeof useComposer > | null = null;
			const Probe = () => {
				composer = useComposer();
				return null;
			};

			renderWithComposer(
				<>
					<Probe />
					<ComposerOverflowHandoff text="my long draft" />
				</>,
				{ withMode: true, config: trackingConfig }
			);

			act( () => composer!.markOverLimit() );

			const button = await screen.findByRole( 'button', { name: /Move to editor/i } );
			await user.click( button );

			await waitFor( () => {
				const openedCalls = recordSpy.mock.calls.filter(
					( call ) => call[ 0 ] === 'test_composer_overflow_handoff_editor_opened'
				);
				expect( openedCalls ).toHaveLength( 1 );
				expect( openedCalls[ 0 ][ 1 ] ).toEqual( {
					connection_id: 1,
					mode_kind: 'standalone',
					site_id: 100,
				} );
			} );
		} finally {
			openSpy.mockRestore();
		}
	} );

	it( 'does not fire overflowHandoff Tracks events when the config omits the section', async () => {
		const user = userEvent.setup();
		const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );

		try {
			mockSitesQuery( [
				{
					ID: 100,
					name: 'My Blog',
					slug: 'myblog.wordpress.com',
					URL: 'https://myblog.wordpress.com',
					site_migration: { in_progress: false, is_complete: false },
					options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
				} as Partial< Site >,
			] );
			nock( ORIGIN )
				.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
				.reply( 200, { ID: 555 } );

			let composer: ReturnType< typeof useComposer > | null = null;
			const Probe = () => {
				composer = useComposer();
				return null;
			};

			// `testComposerConfig` (the default) has no `overflowHandoff`
			// field — protocols opt in by setting it. Confirm the
			// section + click path stay silent in that case.
			renderWithComposer(
				<>
					<Probe />
					<ComposerOverflowHandoff text="my long draft" />
				</>,
				{ withMode: true }
			);

			act( () => composer!.markOverLimit() );

			const button = await screen.findByRole( 'button', { name: /Move to editor/i } );
			await user.click( button );
			await waitFor( () => expect( openSpy ).toHaveBeenCalled() );

			const handoffCalls = recordSpy.mock.calls.filter( ( call ) =>
				String( call[ 0 ] ).includes( 'overflow_handoff' )
			);
			expect( handoffCalls ).toHaveLength( 0 );
		} finally {
			openSpy.mockRestore();
		}
	} );
} );

describe( 'ComposerOverflowHandoff — picker disabled during mutation', () => {
	it( 'disables the combobox while the draft is saving', async () => {
		const user = userEvent.setup();
		mockSitesQuery( [
			{
				ID: 100,
				name: 'A',
				slug: 'a.wordpress.com',
				URL: 'https://a.wordpress.com',
				site_migration: { in_progress: false, is_complete: false },
				options: { admin_url: 'https://a.wordpress.com/wp-admin/' },
			} as Partial< Site >,
			{
				ID: 200,
				name: 'B',
				slug: 'b.wordpress.com',
				URL: 'https://b.wordpress.com',
				site_migration: { in_progress: false, is_complete: false },
				options: { admin_url: 'https://b.wordpress.com/wp-admin/' },
			} as Partial< Site >,
		] );
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/settings/ )
			.reply( 200, { primary_site_ID: 100 } );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.delay( 200 )
			.reply( 200, { ID: 9, site_ID: 100, URL: 'https://a.wordpress.com/?p=9' } );

		let composer: ReturnType< typeof useComposer > | null = null;
		function Probe() {
			composer = useComposer();
			return null;
		}

		const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );

		try {
			renderWithComposer(
				<>
					<Probe />
					<ComposerOverflowHandoff text="hi" />
				</>,
				{ withMode: true }
			);

			act( () => composer!.markOverLimit() );

			const combobox = await screen.findByRole( 'combobox' );
			const button = await screen.findByRole( 'button', { name: /Move to editor/i } );
			await user.click( button );

			expect( combobox ).toBeDisabled();
		} finally {
			openSpy.mockRestore();
		}
	} );
} );
