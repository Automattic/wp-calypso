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
import '../../../../../../../../../sites/site';

describe( '/sites/$siteSlug/settings/crontab/$cronId/edit', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ testSite.ID }/hosting/crontab` )
			.query( true )
			.reply( 200, {
				crontabs: [
					{
						cron_id: 1,
						schedule: '0 * * * *',
						requested_schedule: '0 * * * *',
						command: 'wp cron',
					},
				],
			} );
	} );

	test( 'renders', async () => {
		mockSite();

		await renderRoute( `/sites/${ testSite.slug }/settings/crontab/1/edit` );

		expect( await screen.findByRole( 'heading', { name: 'Edit scheduled job' } ) ).toBeVisible();
	} );
} );
