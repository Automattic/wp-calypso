/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteBeingSetUp from '../site-being-set-up';

const SITE_SLUG = 'moving-site.wpcomstaging.com';

const mockSite = ( capabilities: Record< string, boolean > ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ SITE_SLUG }` )
		.query( true )
		.reply( 200, { ID: 99, slug: SITE_SLUG, capabilities } );

describe( '<SiteBeingSetUp>', () => {
	afterEach( () => nock.cleanAll() );

	test( 'tells the owner their site is being set up', async () => {
		mockSite( {} );

		render( <SiteBeingSetUp siteSlug={ SITE_SLUG } /> );

		expect( await screen.findByRole( 'heading', { name: SITE_SLUG } ) ).toBeVisible();
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'We’re setting up your site.' );
	} );

	test( 'checks the site again until the owner can manage it', async () => {
		mockSite( {} );
		const ready = mockSite( { manage_options: true } );

		render( <SiteBeingSetUp siteSlug={ SITE_SLUG } /> );

		await waitFor( () => expect( ready.isDone() ).toBe( true ), { timeout: 5000 } );
	} );
} );
