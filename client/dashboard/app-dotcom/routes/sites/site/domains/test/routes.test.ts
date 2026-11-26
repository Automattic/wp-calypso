/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { defaultUser } from '../../../../../../test-utils';
import {
	mockPreferences,
	mockSite,
	renderRoute,
	testSite,
} from '../../../../test-utils/render-route';
import '..';
import '../../layout';
import type { User } from '@automattic/api-core';

const user: User = { ...defaultUser, meta: { links: {}, data: { flags: { active_flags: [] } } } };

describe( '/sites/$siteSlug/domains', () => {
	beforeEach( () => {
		mockPreferences();
		mockSite();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ testSite.ID }/domains/redirect` )
			.query( true )
			.reply( 200, {} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/domains/bulk-actions' )
			.query( true )
			.reply( 200, {} );
	} );

	test( 'renders', async () => {
		await renderRoute( `/sites/${ testSite.slug }/domains`, { user } );

		expect( await screen.findByRole( 'heading', { name: 'Domains' } ) ).toBeVisible();
	} );
} );
