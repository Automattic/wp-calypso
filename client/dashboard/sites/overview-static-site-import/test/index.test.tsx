/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import StaticSiteImportCard from '../index';
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

		render( <StaticSiteImportCard site={ site } search={ search } /> );

		expect( screen.getByRole( 'heading', { name: 'We’re moving your site' } ) ).toBeVisible();
		await waitFor( () => expect( approve.isDone() ).toBe( true ) );
	} );

	it( 'asks for feedback and offers the kept domain once the site is ready', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'finished', { site_url: 'https://busybears.wordpress.com' } ) );

		const { recordTracksEvent } = render(
			<StaticSiteImportCard site={ site } search={ search } />
		);

		expect( await screen.findByText( 'Your site is ready' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Connect busybearscleaning.com' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( 'initialQuery=busybearscleaning.com' )
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Looks right' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_static_site_import_feedback',
			{ site_id: 42, platform: 'wix', rating: 'good' }
		);
		expect( screen.getByText( 'Thanks for the feedback!' ) ).toBeVisible();
	} );

	it( 'offers to read the site again when the preview has expired', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 404, { code: 'static_site_import_preview_expired', message: 'Expired' } );

		render( <StaticSiteImportCard site={ site } search={ search } /> );

		expect( await screen.findByRole( 'link', { name: 'Read my site again' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/setup/static-site-import/static-site-import-reading' )
		);
	} );
} );
