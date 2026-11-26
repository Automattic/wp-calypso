/**
 * @vitest-environment jsdom
 */
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
import type { Site } from '@automattic/api-core';

describe( '/sites/$siteSlug/trial-ended', () => {
	beforeEach( () => {
		mockPreferences();
	} );

	test( 'renders', async () => {
		mockSite( {
			...testSite,
			was_hosting_trial: true,
			plan: { is_free: true, features: { active: [] } },
		} as unknown as Site );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.4/sites/${ testSite.ID }/plans` )
			.query( true )
			.reply( 200, {
				plans: {
					1008: {
						product_id: 1008,
						product_slug: 'business-bundle',
						currency_code: 'USD',
						formatted_price: '$300',
						raw_price: 300,
						raw_price_integer: 30000,
						raw_discount: 0,
						raw_discount_integer: 0,
						original_price: { amount: 300 },
						cost_overrides: [],
					},
				},
			} );

		await renderRoute( `/sites/${ testSite.slug }/trial-ended` );

		expect(
			await screen.findByRole( 'heading', { name: 'Your free trial has ended' } )
		).toBeVisible();
	} );

	test( 'redirects to /sites/$siteSlug when the site’s trial hasn’t ended', async () => {
		mockSite();

		const { router } = await renderRoute( `/sites/${ testSite.slug }/trial-ended` );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ testSite.slug }` )
		);
	} );
} );
