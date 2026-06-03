import { scheduleDowngrade, cancelScheduledDowngrade } from '../mutators';

const mockPost = jest.fn();
jest.mock( '../../wpcom-fetcher', () => ( {
	wpcom: {
		req: {
			post: ( ...args: unknown[] ) => mockPost( ...args ),
		},
	},
} ) );

function makeRawPurchase( overrides = {} ) {
	return {
		ID: '123',
		attached_to_purchase_id: null,
		ownership_id: '1',
		product_id: '1009',
		blog_id: '456',
		user_id: '789',
		is_domain: false,
		is_domain_registration: false,
		scheduled_downgrade_product_id: null,
		scheduled_downgrade_product_slug: null,
		scheduled_downgrade_renewal_date: null,
		...overrides,
	};
}

describe( 'scheduleDowngrade', () => {
	beforeEach( () => {
		mockPost.mockReset();
	} );

	test( 'POSTs to the correct path with target_product_id in the body', async () => {
		const rawUpgrade = makeRawPurchase( {
			scheduled_downgrade_product_id: 1003,
			scheduled_downgrade_product_slug: 'personal-bundle',
			scheduled_downgrade_renewal_date: '2026-07-01',
		} );
		mockPost.mockResolvedValue( { success: true, upgrade: rawUpgrade } );

		const result = await scheduleDowngrade( 123, 1003 );

		expect( mockPost ).toHaveBeenCalledWith( {
			path: '/upgrades/123/schedule-downgrade',
			apiVersion: '1.1',
			body: { target_product_id: 1003 },
		} );
		expect( result.success ).toBe( true );
		expect( result.upgrade.ID ).toBe( 123 );
		expect( result.upgrade.scheduled_downgrade_product_id ).toBe( 1003 );
	} );
} );

describe( 'cancelScheduledDowngrade', () => {
	beforeEach( () => {
		mockPost.mockReset();
	} );

	test( 'POSTs to the correct path with no body', async () => {
		const rawUpgrade = makeRawPurchase( {
			scheduled_downgrade_product_id: null,
			scheduled_downgrade_product_slug: null,
			scheduled_downgrade_renewal_date: null,
		} );
		mockPost.mockResolvedValue( { success: true, upgrade: rawUpgrade } );

		const result = await cancelScheduledDowngrade( 123 );

		expect( mockPost ).toHaveBeenCalledWith( {
			path: '/upgrades/123/cancel-scheduled-downgrade',
			apiVersion: '1.1',
		} );
		expect( result.success ).toBe( true );
		expect( result.upgrade.scheduled_downgrade_product_id ).toBeNull();
	} );
} );
