/**
 * @jest-environment jsdom
 */
import { renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import {
	StaticSiteImportNotice,
	StaticSiteImportProgress,
	useOpenPreviewWhenReady,
	useStaticSiteImport,
} from '../index';
import type { StaticSiteImport as StaticSiteImportState } from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 42,
	slug: 'busybears.wordpress.com',
	URL: 'https://busybears.wordpress.com',
	options: { admin_url: 'https://busybears.wordpress.com/wp-admin/' },
} as unknown as Site;

const search = {
	importSessionId: 'abc123',
	from: 'busybearscleaning.com',
	platform: 'wix',
};

const session = ( state: string, extra = {} ) => ( {
	session_id: 'abc123',
	status: 'new',
	state,
	source_digest: 'digest',
	preview_summary: { pages: 12 },
	site_url: '',
	...extra,
} );

const mockApi = () => nock( 'https://public-api.wordpress.com' );

function StaticSiteImport() {
	const siteImport = useStaticSiteImport( site, search.importSessionId );
	if ( ! siteImport ) {
		return null;
	}
	return siteImport.status === 'moving' ? (
		<StaticSiteImportProgress siteImport={ siteImport } search={ search } />
	) : (
		<StaticSiteImportNotice site={ site } siteImport={ siteImport } search={ search } />
	);
}

describe( 'StaticSiteImportCard', () => {
	it( 'names this site as the destination while the site is still being read', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'capturing' ) );
		const approve = mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve', ( body ) => {
				expect( body ).toEqual( { destination_blog_id: 42 } );
				return true;
			} )
			.reply( 200, session( 'queued' ) );
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'queued' ) );

		render( <StaticSiteImport /> );

		expect( screen.getByRole( 'heading', { name: 'We’re moving your site' } ) ).toBeVisible();
		await waitFor( () => expect( approve.isDone() ).toBe( true ) );
	} );

	it( 'does not approve again once delivery is bound to this site', async () => {
		const sessionRequest = mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'queued', { site_url: 'https://busybears.wordpress.com' } ) );
		const approve = mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve' )
			.reply( 200, session( 'queued' ) );

		render( <StaticSiteImport /> );

		await waitFor( () => expect( sessionRequest.isDone() ).toBe( true ) );
		expect( screen.getByRole( 'heading', { name: 'We’re moving your site' } ) ).toBeVisible();
		expect( approve.isDone() ).toBe( false );
	} );

	it( 'keeps moving while another approval holds the delivery', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.times( 2 )
			.query( true )
			.reply( 200, session( 'building' ) );
		const approve = mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve' )
			.reply( 409, {
				code: 'static_site_import_session_approval_in_progress',
				message: 'Another approval is in progress.',
			} );

		render( <StaticSiteImport /> );

		await waitFor( () => expect( approve.isDone() ).toBe( true ) );
		expect( screen.getByRole( 'heading', { name: 'We’re moving your site' } ) ).toBeVisible();
	} );

	it( 'offers to connect the kept domain and preview the site once it is ready', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		render( <StaticSiteImport /> );

		expect( await screen.findByText( 'Your site is ready' ) ).toBeVisible();
		expect(
			screen.getByText(
				'busybearscleaning.com is copied and running on WordPress.com. It stays private until you launch it.'
			)
		).toBeVisible();

		const connect = screen.getByRole( 'link', { name: 'Connect busybearscleaning.com' } );
		expect( connect ).toHaveAttribute(
			'href',
			expect.stringContaining( 'initialQuery=busybearscleaning.com' )
		);
		expect( connect ).toHaveClass( 'is-primary' );

		const preview = screen.getByRole( 'link', { name: /Preview site/ } );
		expect( preview ).toHaveAttribute( 'href', 'https://busybears.wordpress.com' );
		expect( preview ).toHaveClass( 'is-secondary' );

		expect( screen.queryByText( 'Does it look right?' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Looks right' } ) ).not.toBeInTheDocument();
	} );

	it( 'offers a generic Connect domain when the old address is missing', () => {
		render(
			<StaticSiteImportNotice
				site={ site }
				siteImport={ { status: 'finished', needsRestart: false } }
				search={ { ...search, from: undefined } }
			/>
		);

		expect( screen.getByText( 'Your site is ready' ) ).toBeVisible();
		const connect = screen.getByRole( 'link', { name: 'Connect domain' } );
		expect( connect ).toHaveClass( 'is-primary' );
		expect( connect ).toHaveAttribute(
			'href',
			expect.stringContaining( '/setup/domain/use-my-domain' )
		);
		expect( connect ).not.toHaveAttribute( 'href', expect.stringContaining( 'initialQuery' ) );
	} );

	it( 'does not ask for feedback after the site is previewed', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		const { recordTracksEvent } = render( <StaticSiteImport /> );

		await userEvent.click( await screen.findByRole( 'link', { name: /Preview site/ } ) );

		expect( screen.getByText( 'Your site is ready' ) ).toBeVisible();
		expect( screen.queryByText( 'Does your site look right?' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Looks right' } ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_static_site_import_feedback',
			expect.anything()
		);
	} );

	describe( 'Tracks', () => {
		const finished = () =>
			mockApi()
				.get( '/wpcom/v2/static-site-import-session/abc123' )
				.query( true )
				.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );
		const props = { site_id: 42, source_platform: 'wix' };

		it( 'records the ready notice being shown once', async () => {
			finished();
			const { recordTracksEvent } = render( <StaticSiteImport /> );

			await screen.findByText( 'Your site is ready' );
			const impressions = jest
				.mocked( recordTracksEvent )
				.mock.calls.filter(
					( [ name ] ) => name === 'calypso_dashboard_static_site_import_ready_notice_impression'
				);
			expect( impressions ).toEqual( [
				[ 'calypso_dashboard_static_site_import_ready_notice_impression', props ],
			] );
		} );

		it( 'records which button in the ready notice was clicked', async () => {
			finished();
			const { recordTracksEvent } = render( <StaticSiteImport /> );

			const connect = await screen.findByRole( 'link', { name: 'Connect busybearscleaning.com' } );
			connect.addEventListener( 'click', ( event ) => event.preventDefault() );
			await userEvent.click( connect );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_static_site_import_ready_notice_click',
				{ ...props, action: 'connect_domain' }
			);

			await userEvent.click( screen.getByRole( 'link', { name: /Preview site/ } ) );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_static_site_import_ready_notice_click',
				{ ...props, action: 'preview_site' }
			);
		} );

		it( 'records the ready notice being closed', async () => {
			finished();
			const { recordTracksEvent } = render( <StaticSiteImport /> );

			await screen.findByText( 'Your site is ready' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_static_site_import_ready_notice_dismiss',
				props
			);
		} );
	} );

	describe( 'preview site', () => {
		const shareUrl = 'https://busybears.wpcomstaging.com/?share=code';

		it( 'offers to view and keep a finished preview instead of connecting a domain', async () => {
			mockApi()
				.get( '/wpcom/v2/static-site-import-session/abc123' )
				.query( true )
				.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );
			mockApi()
				.get( '/wpcom/v2/wow-funnel/pending' )
				.query( true )
				.reply( 200, {
					pending: false,
					preview_sites: [ { blog_id: 42, site_slug: site.slug, share_url: shareUrl } ],
				} );

			render( <StaticSiteImport /> );

			expect( await screen.findByText( 'Your preview is ready' ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'View site' } ) ).toHaveAttribute(
				'href',
				shareUrl
			);
			expect( screen.getByRole( 'link', { name: 'Choose a plan' } ) ).toHaveAttribute(
				'href',
				expect.stringContaining( `/plans/${ site.slug }` )
			);
			expect( screen.queryByRole( 'link', { name: /Connect/ } ) ).not.toBeInTheDocument();
		} );

		const moving: StaticSiteImportState = { status: 'moving', needsRestart: false };
		const finishedPreview: StaticSiteImportState = {
			status: 'finished',
			needsRestart: false,
			isPreview: true,
			previewUrl: shareUrl,
		};

		it.each( [
			{ name: 'opens a preview whose move finishes here', first: moving, opens: true },
			{
				name: 'stays on a preview that had already finished',
				first: finishedPreview,
				opens: false,
			},
		] )( '$name', async ( { first, opens } ) => {
			const assign = jest.fn();
			const originalLocation = window.location;
			Object.defineProperty( window, 'location', { value: { ...originalLocation, assign } } );

			const { rerender } = renderHook( ( siteImport ) => useOpenPreviewWhenReady( siteImport ), {
				initialProps: first,
			} );
			rerender( finishedPreview );

			await waitFor( () => expect( assign.mock.calls ).toEqual( opens ? [ [ shareUrl ] ] : [] ) );
			Object.defineProperty( window, 'location', { value: originalLocation } );
		} );
	} );

	it( 'offers to read the site again when the session is gone', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 404, { code: 'static_site_import_session_not_found', message: 'Not found' } );

		render( <StaticSiteImport /> );

		expect( await screen.findByRole( 'link', { name: 'Read my site again' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/setup/static-site-import/static-site-import-reading' )
		);
	} );

	it( 'stops at a refused site instead of offering to read it again', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply(
				200,
				session( 'failed', { receipt: { success: false, code: 'static_site_capture_blocked' } } )
			);

		render( <StaticSiteImport /> );

		expect( await screen.findByText( 'We can’t import this site' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Read my site again' } ) ).not.toBeInTheDocument();
	} );
} );
