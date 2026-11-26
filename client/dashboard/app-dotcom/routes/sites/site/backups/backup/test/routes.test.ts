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
import '../../layout';
import '../../../../../../../sites/site';
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/backups/$rewindId', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ testSite.ID }/rewind/backups` )
			.query( true )
			.reply( 200, [] );
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			plan: { features: { active: [ HostingFeatures.BACKUPS_SELF_SERVE ] } },
		} as unknown as Site );

		await renderRoute( `/sites/${ testSite.slug }/backups/123` );

		expect( await screen.findByRole( 'heading', { name: 'Backups' } ) ).toBeVisible();
	} );
} );
