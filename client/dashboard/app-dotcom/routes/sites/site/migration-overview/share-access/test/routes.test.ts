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
} from '../../../../../test-utils/render-route';
import '..';
import '../..';
import '../../../layout';
import type { Site } from '@automattic/api-core';

const sourceUrl = 'https://source.example.com';

describe( '/sites/$siteSlug/migration-overview/share-access', () => {
	beforeEach( () => {
		mockPreferences();
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/wpcom/v2/sites/${ testSite.ID }/wordpress-migration/status` )
			.query( true )
			.reply( 200, { source_url: sourceUrl, findings: [] } );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( true )
			.reply( 200, { platform: 'wordpress', url: sourceUrl } );
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			site_migration: { type: 'assisted-wordpress', status_v2: 'pending' },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/migration-overview/share-access` );

		expect(
			await screen.findByRole( 'heading', { name: 'Authorize access to your WordPress site' } )
		).toBeVisible();
	} );

	test( 'redirects to /migration-overview when the customer is running the migration themselves', async () => {
		mockSite( {
			...testSite,
			site_migration: { type: 'wordpress', status_v2: 'pending' },
		} as unknown as Site );

		const { router } = await renderRoute(
			`/sites/${ testSite.slug }/migration-overview/share-access`
		);

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe(
				`/sites/${ testSite.slug }/migration-overview`
			)
		);
	} );
} );
