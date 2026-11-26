/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import {
	mockPreferences,
	mockSite,
	mockSiteSettings,
	renderRoute,
	testSite,
} from '../../../../../test-utils/render-route';
import '..';
import '../../../layout';
import type { Site } from '@automattic/api-core';

const copyableSite = {
	...testSite,
	site_owner: 1,
	is_wpcom_atomic: true,
	plan: { features: { active: [ 'sftp', 'copy-site' ] } },
} as unknown as Site;

function mockPrimaryDataCenter( value: string | null ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ testSite.ID }/hosting/geo-affinity` )
		.query( true )
		.reply( 200, JSON.stringify( value ), { 'Content-Type': 'application/json' } );
}

function mockDataCenter( body: object ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ testSite.ID }/hosting/data-center` )
		.query( true )
		.reply( 200, body );
}

describe( '/sites/$siteSlug/settings/primary-data-center', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	afterEach( () => nock.cleanAll() );

	test( 'renders from the primary data center when the data center endpoint is missing', async () => {
		mockPrimaryDataCenter( 'bur' );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( `/wpcom/v2/sites/${ testSite.ID }/hosting/data-center` )
			.query( true )
			.reply( 404, { code: 'rest_no_route' } );
		mockSite( { ...testSite, plan: { features: { active: [ 'sftp' ] } } } as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/settings/primary-data-center` );

		expect( await screen.findByRole( 'heading', { name: 'Primary data center' } ) ).toBeVisible();
		expect( screen.getByText( 'US West (Burbank, California)' ) ).toBeVisible();
	} );

	test( 'suggests a copy in the data center nearer the visitors, for a site that never chose one', async () => {
		mockPrimaryDataCenter( null );
		mockDataCenter( {
			current: 'dfw',
			preferred: null,
			recommended: 'dca',
			available: [ 'ams', 'bur', 'dca', 'dfw' ],
		} );
		mockSite( copyableSite );

		await renderRoute( `/sites/${ testSite.slug }/settings/primary-data-center` );

		expect(
			await screen.findByText(
				/Most of your visitors are closer to US East \(Washington, D\.C\.\)/
			)
		).toBeVisible();
		const copyLink = screen.getByRole( 'link', { name: 'Copy to this data center' } );
		const url = new URL( copyLink.getAttribute( 'href' ) as string, 'https://wordpress.com' );
		expect( url.pathname ).toBe( '/setup/copy-site' );
		expect( url.searchParams.get( 'sourceSlug' ) ).toBe( testSite.slug );
		expect( url.searchParams.get( 'dataCenter' ) ).toBe( 'dca' );
	} );
} );
