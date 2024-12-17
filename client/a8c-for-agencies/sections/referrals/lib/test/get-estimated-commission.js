import {
	getEstimatedCommission,
	getProductCommissionPercentage,
	getDailyPrice,
} from '../get-estimated-commission';

describe( 'getProductCommissionPercentage', () => {
	it( 'returns 0 for undefined slug', () => {
		expect( getProductCommissionPercentage( undefined ) ).toBe( 0 );
	} );

	it( 'returns 20% for hosting products', () => {
		expect( getProductCommissionPercentage( 'wpcom-hosting' ) ).toBe( 0.2 );
		expect( getProductCommissionPercentage( 'pressable-hosting' ) ).toBe( 0.2 );
	} );

	it( 'returns 50% for Jetpack and WooCommerce products', () => {
		expect( getProductCommissionPercentage( 'jetpack-backup' ) ).toBe( 0.5 );
		expect( getProductCommissionPercentage( 'woocommerce-payments' ) ).toBe( 0.5 );
	} );

	it( 'returns 0 for unknown products', () => {
		expect( getProductCommissionPercentage( 'unknown-product' ) ).toBe( 0 );
	} );
} );

describe( 'getDailyPrice', () => {
	const mockProduct = {
		product_id: 1,
		price_per_unit: 100,
		supported_bundles: [
			{ quantity: 5, price_per_unit: 90 },
			{ quantity: 10, price_per_unit: 80 },
		],
	};

	it( 'returns price_per_unit for quantity of 1', () => {
		expect( getDailyPrice( mockProduct, 1 ) ).toBe( 100 );
	} );

	it( 'returns bundle price for matching quantity', () => {
		expect( getDailyPrice( mockProduct, 5 ) ).toBe( 90 );
		expect( getDailyPrice( mockProduct, 10 ) ).toBe( 80 );
	} );

	it( 'returns 0 for non-matching quantity', () => {
		expect( getDailyPrice( mockProduct, 3 ) ).toBe( 0 );
	} );

	it( 'handles empty supported_bundles', () => {
		const productWithoutBundles = {
			product_id: 1,
			price_per_unit: 100,
			supported_bundles: [],
		};

		expect( getDailyPrice( productWithoutBundles, 1 ) ).toBe( 100 );
	} );
} );

describe( 'getEstimatedCommission', () => {
	const mockDate = new Date( '2024-03-15' );
	const mockProduct = {
		product_id: 1,
		family_slug: 'jetpack-backup',
		price_per_unit: 100,
		supported_bundles: [],
		name: 'Mock Product',
		slug: 'mock-product',
		currency: 'USD',
		amount: '100',
		price_interval: 'month',
	};

	it( 'returns 0 for empty referrals', () => {
		expect( getEstimatedCommission( [], [ mockProduct ], mockDate ) ).toBe( 0 );
	} );

	it( 'calculates commission for active purchase within window', () => {
		const referrals = [
			{
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: null,
						},
					},
				],
			},
		];

		// Payout window is Jan 1 - Mar 31 for the mock date
		// License issued on Mar 1, so 30 days * $100 daily price * 50% commission = 1500 cents
		// Convert to dollars by dividing by 100
		expect( getEstimatedCommission( referrals, [ mockProduct ], mockDate ) ).toBe( 15 );
	} );

	it( 'handles cancelled purchases', () => {
		const referrals = [
			{
				purchases: [
					{
						product_id: 1,
						status: 'cancelled',
						quantity: 1,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: '2024-03-10T00:00:00Z',
						},
					},
				],
			},
		];

		// 9 days * $100 daily price * 50% commission = 450 cents
		// Convert to dollars by dividing by 100
		expect( getEstimatedCommission( referrals, [ mockProduct ], mockDate ) ).toBe( 4.5 );
	} );

	it( 'skips pending purchases', () => {
		const referrals = [
			{
				purchases: [
					{
						product_id: 1,
						status: 'pending',
						quantity: 1,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: null,
						},
					},
				],
			},
		];

		// Pending purchases should not contribute to commission
		expect( getEstimatedCommission( referrals, [ mockProduct ], mockDate ) ).toBe( 0 );
	} );

	it( 'calculates commission for multiple purchases in single referral', () => {
		const referrals = [
			{
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: null,
						},
					},
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: null,
						},
					},
				],
			},
		];

		// 30 days * $100 daily price * 50% commission * 2 purchases = 3000 cents
		// Convert to dollars by dividing by 100
		expect( getEstimatedCommission( referrals, [ mockProduct ], mockDate ) ).toBe( 30 );
	} );

	it( 'calculates commission for multiple referrals', () => {
		const referrals = [
			{
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: null,
						},
					},
				],
			},
			{
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 1,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: null,
						},
					},
				],
			},
		];

		// 30 days * $100 daily price * 50% commission * 2 referrals = 3000 cents
		// Convert to dollars by dividing by 100
		expect( getEstimatedCommission( referrals, [ mockProduct ], mockDate ) ).toBe( 30 );
	} );

	it( 'calculates commission with bundle pricing', () => {
		const productWithBundle = {
			...mockProduct,
			supported_bundles: [ { quantity: 5, price_per_unit: 90 } ],
		};

		const referrals = [
			{
				purchases: [
					{
						product_id: 1,
						status: 'active',
						quantity: 5,
						license: {
							issued_at: '2024-03-01T00:00:00Z',
							revoked_at: null,
						},
					},
				],
			},
		];

		// 30 days * $90 daily price * 50% commission = 1350 cents
		// Convert to dollars by dividing by 100
		expect( getEstimatedCommission( referrals, [ productWithBundle ], mockDate ) ).toBe( 13.5 );
	} );
} );
