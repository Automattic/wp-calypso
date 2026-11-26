/**
 * @vitest-environment jsdom
 */

import { HostingFeatures } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import nock from 'nock';
import {
	mockPreferences,
	mockSite,
	mockSiteSettings,
	renderRoute,
	testSite,
} from '../../../../../test-utils/render-route';
import '../..';
import '../../../../../../../sites/site';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/scan/history', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ testSite.ID }/scan` )
			.query( true )
			.reply( 200, { state: 'idle', threats: [] } );
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ HostingFeatures.SCAN_SELF_SERVE ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/scan/history` );

		expect( await screen.findByRole( 'heading', { name: 'History' } ) ).toBeVisible();
	} );
} );
