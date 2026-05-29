import { adaptFollow } from '../adapters';

describe( 'read follows adapters', () => {
	it( 'preserves subscription classification fields', () => {
		const follow = adaptFollow( {
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
		const follow = adaptFollow( {
			ID: 'not-a-number',
			URL: 'https://example.com/feed/',
		} );

		expect( follow.ID ).toBeUndefined();
		expect( follow ).not.toHaveProperty( 'ID', NaN );
	} );
} );
