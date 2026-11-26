/**
 * @vitest-environment jsdom
 */

import { HostingFeatures } from '@automattic/api-core';
import config from '@automattic/calypso-config';
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
import '../../layout';
import '../../../layout';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/performance/backend', () => {
	beforeEach( () => {
		config.enable( 'performance/apm' );
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [ { slug: 'a8c' } ] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ testSite.ID }/hosting/apm/aggregate` )
			.query( true )
			.reply( 200, { aggregates: [] } );
	} );

	afterEach( () => {
		config.disable( 'performance/apm' );
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: {
				product_slug: 'business-bundle',
				features: { active: [ HostingFeatures.PERFORMANCE ] },
			},
		} as unknown as Site );

		const { router } = await renderRoute( `/sites/${ testSite.slug }/performance/backend` );

		expect( await screen.findByRole( 'heading', { name: 'Performance' } ) ).toBeVisible();
		expect( router.state.location.pathname ).toBe(
			`/sites/${ testSite.slug }/performance/backend`
		);
	} );
} );
