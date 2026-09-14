import {
	adaptSiteSubscription,
	adaptSiteSubscriptionsResponse,
	prepareComparableUrl,
} from '../adapters';

describe( 'read follows adapters', () => {
	it( 'prepares comparable URLs by stripping protocol, lowercasing, and removing one trailing slash', () => {
		expect( prepareComparableUrl( 'HTTPS://Example.COM/Feed/' ) ).toBe( 'example.com/feed' );
		expect( prepareComparableUrl( 'https://example.com/feed//' ) ).toBe( 'example.com/feed/' );
	} );

	it( 'preserves subscription classification fields', () => {
		const follow = adaptSiteSubscription( {
			ID: '123',
			URL: 'https://example.com/feed/',
			is_paid_subscription: true,
			is_wpforteams_site: true,
			is_rss: true,
			is_comp: true,
			comp_id: 456,
			meta: {
				links: {
					site: 'https://example.com',
					feed: 'https://example.com/feed/',
				},
			},
		} );

		expect( follow ).toMatchObject( {
			is_paid_subscription: true,
			is_wpforteams_site: true,
			is_rss: true,
			is_comp: true,
			comp_id: 456,
			meta: {
				links: {
					site: 'https://example.com',
					feed: 'https://example.com/feed/',
				},
			},
		} );
	} );

	it( 'does not adapt malformed IDs to NaN', () => {
		const follow = adaptSiteSubscription( {
			ID: 'not-a-number',
			URL: 'https://example.com/feed/',
		} );

		expect( follow.ID ).toBeUndefined();
		expect( follow ).not.toHaveProperty( 'ID', NaN );
	} );

	it( 'adapts a partial response to an empty page', () => {
		expect( adaptSiteSubscriptionsResponse( { page: 1, number: 200 } ) ).toEqual( {
			subscriptions: [],
			totalCount: null,
			page: 1,
			number: 200,
		} );
	} );
} );
