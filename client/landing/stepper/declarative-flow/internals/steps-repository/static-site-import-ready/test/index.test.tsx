/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import StaticSiteImportReady from '..';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StaticSiteImportSession } from '@automattic/api-core';

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteId: 42, siteSlug: 'busybears.wordpress.com' } ),
} ) );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const session = (
	state: StaticSiteImportSession[ 'state' ],
	extra: Partial< StaticSiteImportSession > = {}
): StaticSiteImportSession => ( {
	session_id: 'abc123',
	status: 'new',
	state,
	source_digest: 'digest',
	preview_summary: { pages: 12 },
	site_url: '',
	...extra,
} );

const ENTRY =
	'/static-site-import-ready?from=busybearscleaning.com&platform=wix&importSessionId=abc123&siteId=42';

const render = () => {
	const submit = jest.fn();
	renderStep(
		<StaticSiteImportReady
			{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-ready' } ) }
		/>,
		{ initialEntry: ENTRY }
	);
	return submit;
};

describe( 'StaticSiteImportReady', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'approves the archive the user saw onto the new site', async () => {
		let approvedBody: Record< string, unknown > = {};
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'preview_ready', { archive_hash: 'hash-1' } ) );
		mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve', ( body ) => {
				approvedBody = body;
				return true;
			} )
			.query( true )
			.reply( 200, session( 'queued', { archive_hash: 'hash-1' } ) );

		const submit = render();

		expect(
			screen.getByText(
				'We’ll rebuild busybearscleaning.com on WordPress.com. Your Wix site stays exactly as it is.'
			)
		).toBeVisible();

		const button = screen.getByRole( 'button', { name: 'Move my site' } );
		await waitFor( () => expect( button ).toBeEnabled() );
		await userEvent.click( button );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'approved' } ) );
		expect( approvedBody ).toEqual( { archive_hash: 'hash-1', destination_blog_id: 42 } );
	} );

	it( 'moves on when the session was already approved', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'queued' ) );

		const submit = render();

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'approved' } ) );
	} );

	it( 'offers to read the site again when the preview has expired', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'failed', { receipt: { success: false, code: 'expired' } } ) );

		const submit = render();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Read my site again' } ) );

		expect( submit ).toHaveBeenCalledWith( { action: 'restart' } );
	} );

	it( 'explains when the plan cannot host the imported site', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'preview_ready', { archive_hash: 'hash-1' } ) );
		mockApi()
			.post( '/wpcom/v2/static-site-import-session/abc123/approve' )
			.query( true )
			.reply( 403, {
				code: 'static_site_import_atomic_unavailable',
				message: 'This site cannot become an Atomic site.',
			} );

		const submit = render();

		const button = screen.getByRole( 'button', { name: 'Move my site' } );
		await waitFor( () => expect( button ).toBeEnabled() );
		await userEvent.click( button );

		expect( await screen.findByText( /Your plan can’t host an imported site/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Upgrade plan' } ) ).toHaveAttribute(
			'href',
			'/plans/busybears.wordpress.com'
		);
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'shows the outcome of a delivery that already failed', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply(
				200,
				session( 'failed', {
					site_url: 'https://busybears.wordpress.com/',
					receipt: { success: false, code: 'static_site_import_atomic_delivery_failed' },
				} )
			);

		const submit = render();

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'approved' } ) );
	} );
} );
