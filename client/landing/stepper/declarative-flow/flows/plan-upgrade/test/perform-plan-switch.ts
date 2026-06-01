/**
 * @jest-environment jsdom
 */
import { performPlanSwitch } from '../perform-plan-switch';

const mockCancelAndRefundPurchase = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	cancelAndRefundPurchase: ( ...args: unknown[] ) => mockCancelAndRefundPurchase( ...args ),
} ) );

jest.mock( 'calypso/dashboard/utils/link', () => ( {
	dashboardLink: ( path = '' ) => 'https://dashboard.example' + path,
	dashboardOrigins: () => [ 'https://dashboard.example' ],
} ) );

const baseArgs = {
	purchaseId: 123,
	targetProductId: 1009,
	siteSlug: 'example.wordpress.com',
	redirectTo: '/me/purchases',
};

describe( 'performPlanSwitch', () => {
	beforeEach( () => {
		mockCancelAndRefundPurchase.mockReset();
	} );

	it( 'fires the downgrade mutation with the target product id', async () => {
		mockCancelAndRefundPurchase.mockResolvedValue( { new_subscription_id: 999 } );

		await performPlanSwitch( baseArgs, jest.fn() );

		expect( mockCancelAndRefundPurchase ).toHaveBeenCalledWith( 123, {
			type: 'downgrade',
			to_product_id: 1009,
		} );
	} );

	it( 'navigates to the new legacy purchase settings with a downgraded notice on success', async () => {
		mockCancelAndRefundPurchase.mockResolvedValue( { new_subscription_id: 999 } );
		const navigate = jest.fn();

		await performPlanSwitch( baseArgs, navigate );

		expect( navigate ).toHaveBeenCalledWith(
			'/me/purchases/example.wordpress.com/999?downgraded=true'
		);
	} );

	it( 'includes refund params when a refund is provided', async () => {
		mockCancelAndRefundPurchase.mockResolvedValue( { new_subscription_id: 999 } );
		const navigate = jest.fn();

		await performPlanSwitch(
			{ ...baseArgs, refund: { amount: 48, currencySymbol: '$' } },
			navigate
		);

		const url = navigate.mock.calls[ 0 ][ 0 ];
		expect( url ).toContain( 'downgraded=true' );
		expect( url ).toContain( 'refund=48' );
		expect( url ).toContain( 'currency=' );
	} );

	it( 'omits refund params when the refund amount is zero', async () => {
		mockCancelAndRefundPurchase.mockResolvedValue( { new_subscription_id: 999 } );
		const navigate = jest.fn();

		await performPlanSwitch(
			{ ...baseArgs, refund: { amount: 0, currencySymbol: '$' } },
			navigate
		);

		expect( navigate.mock.calls[ 0 ][ 0 ] ).not.toContain( 'refund=' );
	} );

	it( 'navigates to the dashboard surface when launched from the dashboard', async () => {
		mockCancelAndRefundPurchase.mockResolvedValue( { new_subscription_id: 999 } );
		const navigate = jest.fn();

		await performPlanSwitch(
			{ ...baseArgs, redirectTo: 'https://dashboard.example/me/billing/purchases' },
			navigate
		);

		expect( navigate ).toHaveBeenCalledWith(
			'https://dashboard.example/me/billing/purchases/999?downgraded=true'
		);
	} );

	it( 'falls back to redirectTo when the backend returns no new_subscription_id', async () => {
		mockCancelAndRefundPurchase.mockResolvedValue( {} );
		const navigate = jest.fn();

		await performPlanSwitch( baseArgs, navigate );

		expect( navigate ).toHaveBeenCalledWith( '/me/purchases?downgraded=true' );
	} );

	it( 'navigates back to the original purchase with a downgrade_failed notice on error', async () => {
		mockCancelAndRefundPurchase.mockRejectedValue( new Error( 'boom' ) );
		const navigate = jest.fn();

		await performPlanSwitch( baseArgs, navigate );

		expect( navigate ).toHaveBeenCalledWith(
			'/me/purchases/example.wordpress.com/123?downgrade_failed=true'
		);
	} );
} );
