/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { defaultUser } from '../../../../../../../test-utils';
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

describe( '/sites/$siteSlug/settings/transfer-site', () => {
	beforeEach( () => {
		mockPreferences();
		mockSiteSettings();
	} );

	test( 'renders', async () => {
		mockSite( { ...testSite, site_owner: defaultUser.ID } as Site );

		await renderRoute( `/sites/${ testSite.slug }/settings/transfer-site` );

		expect( await screen.findByRole( 'heading', { name: 'Transfer site' } ) ).toBeVisible();
	} );
} );
