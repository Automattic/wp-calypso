/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { StaticSiteImportNotice, StaticSiteImportProgress, useStaticSiteImport } from '../index';
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
	domainChoice: 'keep',
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
	it( 'starts the move the user asked for before checkout', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'preview_ready', { archive_hash: 'hash' } ) );
		const approve = mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve', ( body ) => {
				expect( body ).toEqual( { archive_hash: 'hash', destination_blog_id: 42 } );
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

	it( 'offers to connect the kept domain and preview the site once it is ready', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		render( <StaticSiteImport /> );

		expect( await screen.findByText( 'Your site is ready' ) ).toBeVisible();
		expect(
			screen.getByText(
				'busybearscleaning.com is copied and running on WordPress.com. It stays private until you point your domain to it.'
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

	it( 'offers to connect a domain when the old address was not kept', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		function FreeAddressImport() {
			const siteImport = useStaticSiteImport( site, search.importSessionId );
			return siteImport && siteImport.status !== 'moving' ? (
				<StaticSiteImportNotice
					site={ site }
					siteImport={ siteImport }
					search={ { ...search, domainChoice: 'free' } }
				/>
			) : null;
		}
		render( <FreeAddressImport /> );

		const connect = await screen.findByRole( 'link', { name: 'Connect domain' } );
		expect( connect ).toHaveClass( 'is-primary' );
		expect( connect ).toHaveAttribute(
			'href',
			expect.stringContaining( '/setup/domain/use-my-domain' )
		);
		expect( connect ).not.toHaveAttribute( 'href', expect.stringContaining( 'initialQuery' ) );
	} );

	it( 'asks whether the site looks right only after it has been previewed', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		const { recordTracksEvent } = render( <StaticSiteImport /> );

		const preview = await screen.findByRole( 'link', { name: /Preview site/ } );
		expect( screen.queryByText( 'Does your site look right?' ) ).not.toBeInTheDocument();

		await userEvent.click( preview );
		expect( screen.getByText( 'Does your site look right?' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Looks right' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_static_site_import_feedback',
			{ site_id: 42, source_platform: 'wix', rating: 'good' }
		);
		expect( screen.getByText( 'Thanks for the feedback!' ) ).toBeVisible();
	} );

	it( 'keeps the feedback answer when the ready notice is closed', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		const { recordTracksEvent } = render( <StaticSiteImport /> );

		await userEvent.click( await screen.findByRole( 'link', { name: /Preview site/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Looks right' } ) );

		const [ dismissReadyNotice ] = screen.getAllByRole( 'button', { name: 'Dismiss' } );
		await userEvent.click( dismissReadyNotice );

		expect( screen.queryByText( 'Your site is ready' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Thanks for the feedback!' ) ).toBeVisible();
		expect( screen.queryByText( 'Does your site look right?' ) ).not.toBeInTheDocument();
		const feedbackEvents = jest
			.mocked( recordTracksEvent )
			.mock.calls.filter(
				( [ name ] ) => name === 'calypso_dashboard_static_site_import_feedback'
			);
		expect( feedbackEvents ).toHaveLength( 1 );
	} );

	it( 'records a bad rating when the user says something is off', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		const { recordTracksEvent } = render( <StaticSiteImport /> );

		await userEvent.click( await screen.findByRole( 'link', { name: /Preview site/ } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Something’s off' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_static_site_import_feedback',
			{ site_id: 42, source_platform: 'wix', rating: 'bad' }
		);
		expect( screen.getByText( 'Thanks for the feedback!' ) ).toBeVisible();
	} );

	it( 'hides the feedback question when it is closed', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		const { recordTracksEvent } = render( <StaticSiteImport /> );

		await userEvent.click( await screen.findByRole( 'link', { name: /Preview site/ } ) );
		const [ , dismissFeedback ] = screen.getAllByRole( 'button', { name: 'Dismiss' } );
		await userEvent.click( dismissFeedback );

		expect( screen.queryByText( 'Does your site look right?' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Your site is ready' ) ).toBeVisible();
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
		const props = { site_id: 42, source_platform: 'wix', domain_choice: 'keep' };

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

	it( 'offers to read the site again when the preview has expired', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 404, { code: 'static_site_import_preview_expired', message: 'Expired' } );

		render( <StaticSiteImport /> );

		expect( await screen.findByRole( 'link', { name: 'Read my site again' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/setup/static-site-import/static-site-import-reading' )
		);
	} );
} );
