/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	mockPreferences,
	mockSite,
	renderRoute,
	testSite,
} from '../../../../test-utils/render-route';
import '..';
import '../..';
import '../../../../../../sites/site';
import type { Site } from '@automattic/api-core';

function mockWebsiteContent( isWebsiteContentSubmitted: boolean ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ testSite.ID }/do-it-for-me/website-content` )
		.query( true )
		.reply( 200, { is_website_content_submitted: isWebsiteContentSubmitted } );
}

describe( '/sites/$siteSlug/site-building-in-progress', () => {
	beforeEach( () => {
		mockPreferences();
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.2/sites/${ testSite.ID }/domains` )
			.query( true )
			.reply( 200, { domains: [] } );
	} );

	describe( 'while the site is being built', () => {
		beforeEach( () => {
			mockSite( { ...testSite, options: { is_difm_lite_in_progress: true } } as unknown as Site );
		} );

		test( 'renders', async () => {
			mockWebsiteContent( true );

			await renderRoute( `/sites/${ testSite.slug }/site-building-in-progress` );

			expect(
				await screen.findByRole( 'heading', { name: 'Your content submission was successful!' } )
			).toBeVisible();
		} );

		test( 'asks for the website content until it’s submitted', async () => {
			mockWebsiteContent( false );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.2/upgrades' )
				.query( true )
				.reply( 200, [] );

			await renderRoute( `/sites/${ testSite.slug }/site-building-in-progress` );

			expect(
				await screen.findByRole( 'heading', { name: 'Website content not submitted' } )
			).toBeVisible();
		} );
	} );

	test( 'redirects to /sites/$siteSlug when the site isn’t being built', async () => {
		mockSite();

		const { router } = await renderRoute( `/sites/${ testSite.slug }/site-building-in-progress` );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ testSite.slug }` )
		);
	} );
} );
