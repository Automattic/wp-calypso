import nock from 'nock';
import { monetizeSubscriptionQuery, monetizeSubscriptionsQuery } from '../me-monetize';
import { queryClient } from '../query-client';
import type { MonetizeSubscription } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';

function mockSubscriptions( subscriptions: MonetizeSubscription[] ) {
	return nock( BASE )
		.get( '/rest/v1.1/me/memberships/subscriptions' )
		.reply( 200, { subscriptions } );
}

const subscription: MonetizeSubscription = {
	ID: '123',
	currency: 'USD',
	end_date: null,
	product_id: '456',
	renew_interval: '1 month',
	is_renewable: true,
	renewal_price: '1.00',
	site_id: '789',
	site_title: 'A site',
	site_url: 'https://example.com',
	start_date: '2020-01-01',
	status: 'active',
	title: 'A product',
};

describe( 'monetizeSubscriptionQuery', () => {
	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	it( 'fetches the subscription list itself when navigated to directly', async () => {
		mockSubscriptions( [ subscription ] );

		await expect(
			queryClient.fetchQuery( monetizeSubscriptionQuery( subscription.ID ) )
		).resolves.toEqual( subscription );
	} );

	it( 'reuses an already-populated subscriptions cache without refetching', async () => {
		const scope = mockSubscriptions( [ subscription ] );
		await queryClient.prefetchQuery( monetizeSubscriptionsQuery() );

		await expect(
			queryClient.fetchQuery( monetizeSubscriptionQuery( subscription.ID ) )
		).resolves.toEqual( subscription );
		expect( scope.pendingMocks() ).toHaveLength( 0 );
	} );
} );
