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

describe( '/sites/$siteSlug/settings/primary-data-center', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ testSite.ID }/hosting/geo-affinity` )
			.query( true )
			.reply( 200, JSON.stringify( 'bur' ), { 'Content-Type': 'application/json' } );
	} );

	test( 'renders', async () => {
		mockSite( { ...testSite, plan: { features: { active: [ 'sftp' ] } } } as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/settings/primary-data-center` );

		expect( await screen.findByRole( 'heading', { name: 'Primary data center' } ) ).toBeVisible();
	} );
} );
