/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import {
	StaticSiteImportFailed,
	StaticSiteImportNotice,
	StaticSiteImportProgress,
	useStaticSiteImport,
} from '../index';
import type { Site, StaticSiteImportSession } from '@automattic/api-core';

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
	connectable_domain: 'busybearscleaning.com',
	...extra,
} );

const mockApi = () => nock( 'https://public-api.wordpress.com' );

function StaticSiteImport() {
	const siteImport = useStaticSiteImport( site, search.importSessionId );
	if ( ! siteImport ) {
		return null;
	}
	// Mirrors the site Overview: a failed move (unless refused) replaces the progress card.
	if ( siteImport.status === 'moving' ) {
		return <StaticSiteImportProgress siteImport={ siteImport } search={ search } />;
	}
	if ( siteImport.status === 'failed' && ! siteImport.isRefused ) {
		return <StaticSiteImportFailed site={ site } search={ search } />;
	}
	return <StaticSiteImportNotice site={ site } siteImport={ siteImport } search={ search } />;
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

	it( 'offers to get a domain when the old address is missing', () => {
		render(
			<StaticSiteImportNotice
				site={ site }
				siteImport={ { status: 'finished' } }
				search={ { ...search, from: undefined } }
			/>
		);

		expect( screen.getByText( 'Your site is ready' ) ).toBeVisible();
		const getDomain = screen.getByRole( 'link', { name: 'Get a domain' } );
		expect( getDomain ).toHaveClass( 'is-primary' );
		// Domain search: /setup/domain, or /domains/add/<site> in the backported dashboard.
		expect( getDomain ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/setup\/domain|\/domains\/add\/busybears\.wordpress\.com/ )
		);
		expect( getDomain ).not.toHaveAttribute( 'href', expect.stringContaining( 'use-my-domain' ) );
		expect( getDomain ).not.toHaveAttribute( 'href', expect.stringContaining( 'initialQuery' ) );
	} );

	it( 'offers to get a domain when the server names none the customer can connect', () => {
		render(
			<StaticSiteImportNotice
				site={ site }
				siteImport={ {
					status: 'finished',
					session: session( 'finished', { connectable_domain: '' } ) as StaticSiteImportSession,
				} }
				search={ { ...search, from: 'https://ellenbauer37.wixsite.com/my-site-2' } }
			/>
		);

		expect( screen.queryByRole( 'link', { name: /^Connect / } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Get a domain' } ) ).not.toHaveAttribute(
			'href',
			expect.stringContaining( 'initialQuery' )
		);
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

	it( 'shows the failed move with the team and refund options when the move failed', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'failed' ) );
		const purchases = mockApi()
			.get( '/rest/v1.2/upgrades' )
			.query( true )
			.reply( 200, [ { ID: 991, is_plan: true, product_slug: 'personal-bundle' } ] );

		render( <StaticSiteImport /> );

		expect( await screen.findByRole( 'heading', { name: 'Your move stopped' } ) ).toBeVisible();
		await waitFor( () => expect( purchases.isDone() ).toBe( true ) );
		expect( await screen.findByRole( 'link', { name: 'Get a refund' } ) ).toBeVisible();
	} );

	it( 'hands the move to our migrations team as a non-WordPress migration ticket', async () => {
		mockApi().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		const ticket = mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new', {
				blog_url: 'busybears.wordpress.com',
				from_url: 'busybearscleaning.com',
				locale: 'en',
				context: 'site_is_not_wordpress',
			} )
			.reply( 200, { success: true } );

		render( <StaticSiteImportFailed site={ site } search={ search } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Let our team move it' } ) );

		expect( await screen.findByText( 'Our team has your move' ) ).toBeVisible();
		expect( ticket.isDone() ).toBe( true );
	} );

	it( 'shows a neutral notice, not a failed move, when the move can’t be read', async () => {
		// Another account's move, or a wrong or expired link.
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 404, { code: 'static_site_import_session_not_found', message: 'Not found' } );

		render( <StaticSiteImport /> );

		expect( await screen.findByText( 'We can’t show this move' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Your move stopped' } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'Get a refund' } ) ).not.toBeInTheDocument();
	} );

	it( 'offers to try again, not a refund, when naming the destination fails', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.times( 2 )
			.reply( 200, session( 'queued' ) );
		mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve' )
			.reply( 500, { code: 'internal_error', message: 'Something went wrong' } );

		render( <StaticSiteImport /> );

		expect( await screen.findByText( 'Your move hasn’t started yet' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Your move stopped' } )
		).not.toBeInTheDocument();
		nock.cleanAll();
	} );

	it( 'trusts the move over a stale approval error once it finishes', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'queued' ) );
		mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve' )
			.reply( 500, { code: 'internal_error', message: 'Something went wrong' } );
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		render( <StaticSiteImport /> );

		expect( await screen.findByText( 'Your site is ready' ) ).toBeVisible();
		expect( screen.queryByText( 'Your move hasn’t started yet' ) ).not.toBeInTheDocument();
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

describe( 'StaticSiteImportNotice preview link', () => {
	const finished = { status: 'finished' as const };

	it.each( [
		[
			'logs the owner in to a Coming Soon Atomic site on the way',
			{ is_coming_soon: true, is_wpcom_atomic: true },
			'https://busybears.wpcomstaging.com/wp-login.php?redirect_to=%2F',
		],
		[
			'links a launched site directly',
			{ is_coming_soon: false },
			'https://busybears.wordpress.com',
		],
	] )( '%s', ( _, props, href ) => {
		const target = { ...site, ...props } as unknown as Site;

		render( <StaticSiteImportNotice site={ target } siteImport={ finished } search={ search } /> );

		expect( screen.getByRole( 'link', { name: /Preview site/ } ) ).toHaveAttribute( 'href', href );
	} );
} );

describe( 'StaticSiteImportNotice help with the move', () => {
	it( 'hands the move to our migrations team when the moved site isn’t right', async () => {
		const ticket = mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new', {
				blog_url: 'busybears.wordpress.com',
				from_url: 'busybearscleaning.com',
				locale: 'en',
				context: 'site_is_not_wordpress',
			} )
			.reply( 200, { success: true } );
		const { recordTracksEvent } = render(
			<StaticSiteImportNotice
				site={ site }
				siteImport={ { status: 'finished' } }
				search={ search }
			/>
		);

		await userEvent.click(
			screen.getByRole( 'button', { name: 'Something not right? Let our team fix it' } )
		);
		expect( await screen.findByText( /Our team has your move/ ) ).toBeVisible();
		expect( ticket.isDone() ).toBe( true );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_static_site_import_ready_notice_click',
			{ site_id: 42, source_platform: 'wix', action: 'request_handoff' }
		);
	} );

	it.each( [
		[
			'names nothing that comes across as blocks',
			{ navigation: 3, dialogs: 2, media: 1, embeds: 1 },
			null,
		],
		[
			'names what the move found on the old site',
			{ commerce: 4, forms: 1, navigation: 3 },
			'We found a store or ticket sales and forms on busybearscleaning.com. If any of it isn’t working, our team can fix it.',
		],
	] )( '%s', ( _, capabilities, message ) => {
		const finished = {
			status: 'finished' as const,
			session: session( 'finished', {
				preview_summary: { pages: 12, inspection: { measured: true, capabilities } },
			} ) as StaticSiteImportSession,
		};
		render( <StaticSiteImportNotice site={ site } siteImport={ finished } search={ search } /> );

		if ( message ) {
			expect( screen.getByText( message ) ).toBeVisible();
		} else {
			expect( screen.queryByText( /We found/ ) ).not.toBeInTheDocument();
		}
	} );

	it( 'leaves a failed move to the failure card', () => {
		const { container } = render(
			<StaticSiteImportNotice site={ site } siteImport={ { status: 'failed' } } search={ search } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );

describe( 'StaticSiteImportFailed', () => {
	beforeEach( () => nock.cleanAll() );
	afterEach( () => nock.cleanAll() );

	it( 'says nothing is lost and names the old site', async () => {
		const purchases = mockApi().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		render( <StaticSiteImportFailed site={ site } search={ search } /> );
		await waitFor( () => expect( purchases.isDone() ).toBe( true ) );

		expect( screen.getByRole( 'heading', { name: 'Your move stopped' } ) ).toBeVisible();
		expect(
			screen.getByText( 'Nothing is lost, and busybearscleaning.com is still online.' )
		).toBeVisible();
	} );

	it( 'sends Get a refund to cancelling the site’s plan', async () => {
		mockApi()
			.get( '/rest/v1.2/upgrades' )
			.query( true )
			.reply( 200, [
				{ ID: 777, is_plan: false, product_slug: 'domain_map' },
				{ ID: 991, is_plan: true, product_slug: 'personal-bundle-monthly' },
			] );
		// Its own site, so an earlier test's cached purchases don't answer for it.
		const paidSite = { ...site, ID: 77, slug: 'paid.wordpress.com' } as unknown as Site;
		render( <StaticSiteImportFailed site={ paidSite } search={ search } /> );

		await waitFor( () =>
			expect( screen.getByRole( 'link', { name: 'Get a refund' } ) ).toHaveAttribute(
				'href',
				expect.stringContaining( '/me/purchases/paid.wordpress.com/991/cancel' )
			)
		);
	} );

	it( 'offers no refund when the site has no plan to refund', async () => {
		const purchases = mockApi().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		render( <StaticSiteImportFailed site={ site } search={ search } /> );
		await waitFor( () => expect( purchases.isDone() ).toBe( true ) );

		expect( screen.queryByRole( 'link', { name: 'Get a refund' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Let our team move it' } ) ).toBeVisible();
	} );
} );
