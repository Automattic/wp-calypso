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
} from '../../../../../../../test-utils/render-route';
import '..';
import '../../../../../layout';

describe( '/sites/$siteSlug/settings/repositories/manage/$deploymentId', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ testSite.ID }/hosting/code-deployments/1` )
			.query( true )
			.reply( 200, { id: 1, branch_name: 'main', target_dir: '/' } );
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/repositories/manage/1` );

		expect( await screen.findByRole( 'heading', { name: 'Configure Repository' } ) ).toBeVisible();
	} );
} );
