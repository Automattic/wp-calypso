/**
 * @jest-environment jsdom
 */

import { sitePurchasesQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { purchaseSettingsRoute } from '../../../../app/router/me';
import { render } from '../../../../test-utils';
import { PurchaseNotice } from '../purchase-notice';
import type { Purchase } from '@automattic/api-core';

test.each( [
	{ blogId: 1, holding: true, expectedRequests: 0 },
	{ blogId: 0, holding: false, expectedRequests: 0 },
	{ blogId: 1, holding: false, expectedRequests: 1 },
] )(
	'site purchases query for $blogId, holding=$holding',
	async ( { blogId, holding, expectedRequests } ) => {
		jest.spyOn( purchaseSettingsRoute, 'useSearch' ).mockReturnValue( {} );
		jest.spyOn( purchaseSettingsRoute, 'useNavigate' ).mockReturnValue( jest.fn() );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/upgrades' )
			.query( { site: blogId } )
			.reply( 200, [] );
		const purchase = {
			ID: 10,
			blog_id: blogId,
			is_attached_to_holding_site: holding,
			product_slug: 'akismet_free',
			product_name: 'Akismet',
			subscription_status: 'active',
			expiry_status: 'auto-renewing',
			is_auto_renew_enabled: true,
		} as Purchase;
		const { queryClient } = render(
			<>
				<PurchaseNotice purchase={ purchase } />
				<p>Ready</p>
			</>
		);
		await waitFor( () => expect( screen.getByText( 'Ready' ) ).toBeVisible() );
		await waitFor( () => {
			expect(
				queryClient.getQueryState( sitePurchasesQuery( blogId ).queryKey )?.fetchStatus
			).toBe( 'idle' );
		} );
		expect( Number( scope.isDone() ) ).toBe( expectedRequests );
	}
);
