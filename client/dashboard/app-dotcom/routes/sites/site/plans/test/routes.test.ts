/**
 * @vitest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	mockPreferences,
	mockSite,
	renderRoute,
	testSite,
} from '../../../../test-utils/render-route';
import '..';
import '../..';
import '../../layout';

describe( '/sites/$siteSlug/plans', () => {
	beforeEach( () => {
		mockPreferences();
		mockSite();
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.4/sites/${ testSite.ID }/plans` )
			.query( true )
			.reply( 200, { plans: {}, page_context: { page_title: 'Choose your plan' } } );
	} );

	afterEach( () => {
		config.disable( 'dashboard/plans' );
	} );

	test( 'renders', async () => {
		config.enable( 'dashboard/plans' );

		await renderRoute( `/sites/${ testSite.slug }/plans` );

		expect( await screen.findByRole( 'heading', { name: 'Choose your plan' } ) ).toBeVisible();
	} );

	test( 'redirects to /sites/$siteSlug without the dashboard/plans flag', async () => {
		config.disable( 'dashboard/plans' );

		const { router } = await renderRoute( `/sites/${ testSite.slug }/plans` );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ testSite.slug }` )
		);
	} );
} );
