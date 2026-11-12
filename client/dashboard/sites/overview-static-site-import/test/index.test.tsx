/**
 * @jest-environment jsdom
 */
import { renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import {
	StaticSiteImportFailed,
	StaticSiteImportNotice,
	StaticSiteImportProgress,
	useOpenPreviewWhenReady,
	useStaticSiteImport,
} from '../index';
import type { StaticSiteImport as StaticSiteImportState } from '../index';
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
	test( 'names this site as the destination while the site is still being read', async () => {
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

	test( 'does not approve again once delivery is bound to this site', async () => {
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

	test( 'keeps moving while another approval holds the delivery', async () => {
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

	const currentStepOf = ( state: string, extra = {} ) => {
		const siteImport = {
			status: 'moving',
			session: session( state, extra ) as StaticSiteImportSession,
		} as StaticSiteImportState;
		render( <StaticSiteImportProgress siteImport={ siteImport } search={ search } /> );
		const current = screen
			.getAllByRole( 'listitem' )
			.filter( ( item ) => item.getAttribute( 'aria-current' ) === 'step' );
		expect( current ).toHaveLength( 1 );
		return current[ 0 ];
	};

	test.each( [
		[ 'capture_queued', {}, 'Finding your pages' ],
		[ 'capturing', { progress: { phase: 'inspecting' } }, 'Finding your pages' ],
		[
			'capturing',
			{ progress: { phase: 'capturing', finding_pages: true } },
			'Finding your pages',
		],
		[
			'capturing',
			{ progress: { phase: 'capturing', pages_captured: 3, pages_total: 12 } },
			'Copying your pages',
		],
		[ 'building', { progress: { phase: 'building' } }, 'Building your WordPress site' ],
		[ 'building', { progress: { phase: 'exporting' } }, 'Building your WordPress site' ],
		[ 'preview_ready', {}, 'Moving it onto your site' ],
		[ 'queued', {}, 'Moving it onto your site' ],
	] )( 'shows a %s session on the step the server reports', ( state, extra, currentStep ) => {
		expect( currentStepOf( state, extra ) ).toHaveTextContent( currentStep );
	} );

	test( 'counts the pages copied so far while copying', () => {
		const current = currentStepOf( 'capturing', {
			progress: { phase: 'capturing', pages_captured: 3, pages_total: 12 },
		} );

		expect( current ).toHaveTextContent( 'Copying your pages' );
		expect( current ).toHaveTextContent( '3 of 12' );
		expect( screen.getAllByRole( 'listitem' )[ 0 ] ).toHaveTextContent( '12 pages found' );
	} );

	test( 'keeps the number of pages found once the server stops reporting progress', () => {
		currentStepOf( 'queued', { preview_summary: { pages: 15 } } );

		expect( screen.getAllByRole( 'listitem' )[ 0 ] ).toHaveTextContent( '15 pages found' );
	} );

	test( 'moves the checklist forward when the session moves on', () => {
		const moving = ( state: string ) =>
			( { status: 'moving', session: session( state ) } ) as StaticSiteImportState;
		const { rerender } = render(
			<StaticSiteImportProgress siteImport={ moving( 'capturing' ) } search={ search } />
		);

		rerender( <StaticSiteImportProgress siteImport={ moving( 'building' ) } search={ search } /> );

		expect( screen.getAllByRole( 'listitem' )[ 2 ] ).toHaveAttribute( 'aria-current', 'step' );
	} );

	test( 'offers to connect the kept domain and preview the site once it is ready', async () => {
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

		const preview = screen.getByRole( 'link', { name: /Preview site/ } );
		expect( preview ).toHaveAttribute( 'href', 'https://busybears.wordpress.com' );
		expect( preview ).toHaveAttribute( 'target', '_blank' );

		expect( screen.queryByText( 'Does it look right?' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Looks right' } ) ).not.toBeInTheDocument();
	} );

	test( 'offers to get a domain when the old address is missing', () => {
		render(
			<StaticSiteImportNotice
				site={ site }
				siteImport={ { status: 'finished' } }
				search={ { ...search, from: undefined } }
			/>
		);

		expect( screen.getByText( 'Your site is ready' ) ).toBeVisible();
		const getDomain = screen.getByRole( 'link', { name: 'Get a domain' } );
		// Domain search: /setup/domain, or /domains/add/<site> in the backported dashboard.
		expect( getDomain ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/setup\/domain|\/domains\/add\/busybears\.wordpress\.com/ )
		);
		expect( getDomain ).not.toHaveAttribute( 'href', expect.stringContaining( 'use-my-domain' ) );
		expect( getDomain ).not.toHaveAttribute( 'href', expect.stringContaining( 'initialQuery' ) );
	} );

	test( 'offers to get a domain when the server names none the customer can connect', () => {
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

	test( 'does not ask for feedback after the site is previewed', async () => {
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

		test( 'records the ready notice being shown once', async () => {
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

		test( 'records which button in the ready notice was clicked', async () => {
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

		test( 'records the ready notice being closed', async () => {
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

	test( 'shows the failed move with the team and refund options when the move failed', async () => {
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

	test( 'hands the move to our migrations team as a non-WordPress migration ticket', async () => {
		mockApi().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		const ticket = mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new', {
				blog_url: 'busybears.wordpress.com',
				from_url: 'busybearscleaning.com',
				locale: 'en',
				context: 'site_is_not_wordpress',
				import_session_id: 'abc123',
			} )
			.reply( 200, { success: true } );

		render( <StaticSiteImportFailed site={ site } search={ search } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Let our team move it' } ) );

		expect( await screen.findByText( 'Our team has your move' ) ).toBeVisible();
		expect( ticket.isDone() ).toBe( true );
	} );

	describe( 'preview site', () => {
		const shareUrl = 'https://busybears.wpcomstaging.com/?share=code';

		test( 'offers to view and keep a finished preview instead of connecting a domain', async () => {
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
			expect( screen.getByRole( 'link', { name: /View site/ } ) ).toHaveAttribute(
				'href',
				shareUrl
			);
			expect( screen.getByRole( 'link', { name: 'Choose a plan' } ) ).toHaveAttribute(
				'href',
				expect.stringContaining( `/plans/${ site.slug }` )
			);
			expect( screen.queryByRole( 'link', { name: /Connect/ } ) ).not.toBeInTheDocument();
		} );

		const moving: StaticSiteImportState = { status: 'moving' };
		const finishedPreview: StaticSiteImportState = {
			status: 'finished',
			isPreview: true,
			previewUrl: shareUrl,
		};

		test.each( [
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

	test( 'shows a neutral notice, not a failed move, when the move can’t be read', async () => {
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

	test( 'offers to try again, not a refund, when naming the destination fails', async () => {
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
		expect( screen.getByRole( 'button', { name: 'Contact us' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Let our team move it' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'heading', { name: 'Your move stopped' } )
		).not.toBeInTheDocument();
		nock.cleanAll();
	} );

	test( 'asks again to name the destination when trying again, even if the session has not changed', async () => {
		const user = userEvent.setup();
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.times( 3 )
			.reply( 200, session( 'preview_ready' ) );
		mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve' )
			.reply( 500, { code: 'internal_error', message: 'Something went wrong' } );
		const secondApprove = mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve' )
			.reply( 200, session( 'queued' ) );

		render( <StaticSiteImport /> );

		await user.click( await screen.findByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( secondApprove.isDone() ).toBe( true ) );
		nock.cleanAll();
	} );

	test( 'trusts the move over a stale approval error once it finishes', async () => {
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

	test( 'stops at a refused site instead of offering to read it again', async () => {
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

	test.each( [
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
	test( 'hands the move to our migrations team when the moved site isn’t right', async () => {
		const ticket = mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new', {
				blog_url: 'busybears.wordpress.com',
				from_url: 'busybearscleaning.com',
				locale: 'en',
				context: 'site_is_not_wordpress',
				import_session_id: 'abc123',
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

	test( 'stops offering help once wpcom refused the handoff', async () => {
		mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new' )
			.reply( 429, { code: 'too_many_requests', message: 'Server message' } );
		render(
			<StaticSiteImportNotice
				site={ site }
				siteImport={ { status: 'finished' } }
				search={ search }
			/>
		);

		await userEvent.click(
			screen.getByRole( 'button', { name: 'Something not right? Let our team fix it' } )
		);

		expect(
			await screen.findByText( /You’ve already sent us several migration requests today/ )
		).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Something not right? Let our team fix it' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows the note wpcom wrote about what the move found', () => {
		const finished = {
			status: 'finished' as const,
			session: session( 'finished', {
				review_note: 'We found a store on busybearscleaning.com.',
			} ) as StaticSiteImportSession,
		};
		render( <StaticSiteImportNotice site={ site } siteImport={ finished } search={ search } /> );

		expect( screen.getByText( 'We found a store on busybearscleaning.com.' ) ).toBeVisible();
	} );

	test( 'leaves a failed move to the failure card', () => {
		const { container } = render(
			<StaticSiteImportNotice site={ site } siteImport={ { status: 'failed' } } search={ search } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );

describe( 'StaticSiteImportFailed', () => {
	beforeEach( () => nock.cleanAll() );
	afterEach( () => nock.cleanAll() );

	test( 'says nothing is lost and names the old site', async () => {
		const purchases = mockApi().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		render( <StaticSiteImportFailed site={ site } search={ search } /> );
		await waitFor( () => expect( purchases.isDone() ).toBe( true ) );

		expect( screen.getByRole( 'heading', { name: 'Your move stopped' } ) ).toBeVisible();
		expect(
			screen.getByText( 'Nothing is lost, and busybearscleaning.com is still online.' )
		).toBeVisible();
	} );

	test( 'sends Get a refund to cancelling the site’s plan', async () => {
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

	test.each( [
		[
			'tells the customer our team will reach out when wpcom refused the handoff',
			'migration_request_not_submitted',
			'We couldn’t submit your migration request automatically. Our team has been notified and will reach out by email.',
			false,
		],
		[
			'tells the customer they reached today’s limit',
			'too_many_requests',
			'You’ve already sent us several migration requests today. Our team will follow up by email on the ones we’ve received. If you need to add details, just reply to that email.',
			false,
		],
		[
			'asks the customer to try again when our team couldn’t be reached',
			'internal_error',
			'We couldn’t reach our team. Please try again.',
			true,
		],
	] )( '%s', async ( _, code, message, canRetry ) => {
		mockApi().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new' )
			.reply( 422, { code, message: 'Server message', data: { status: 422 } } );
		render( <StaticSiteImportFailed site={ site } search={ search } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Let our team move it' } ) );

		expect( await screen.findByText( message ) ).toBeVisible();
		// A refused handoff would only be refused again, so it isn't offered.
		expect( screen.queryAllByRole( 'button', { name: 'Let our team move it' } ) ).toHaveLength(
			canRetry ? 1 : 0
		);
	} );

	test( 'offers no refund when the site has no plan to refund', async () => {
		const purchases = mockApi().get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		render( <StaticSiteImportFailed site={ site } search={ search } /> );
		await waitFor( () => expect( purchases.isDone() ).toBe( true ) );

		expect( screen.queryByRole( 'link', { name: 'Get a refund' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Let our team move it' } ) ).toBeVisible();
	} );
} );
