import { generateCommissionsCsv } from '../generate-commissions-csv';
import type { Referral, ReferralCommissionPayoutResponse } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

function payoutWithProductName( productName: string ): ReferralCommissionPayoutResponse {
	return {
		total_amount: 100,
		total_commission: 10,
		start_date: '2024-01-01',
		end_date: '2024-01-31',
		next_payout_date: '2024-03-02',
		client_data: [
			{
				client_user_id: 'N/A',
				email: 'client@example.com',
				total_amount: 100,
				total_commission: 10,
				products: [
					{
						product_id: 1,
						product_name: productName,
						total_amount: 100,
						total_commission: 10,
						invoices: [ { payment_date: '2024-01-15', paid_amount: 100, commission_amount: 10 } ],
					},
				],
			},
		],
	};
}

describe( 'generateCommissionsCsv', () => {
	it.each( [ '=HYPERLINK(evil)', '+1+1', '-1', '@SUM(A1)', '\tcmd', '\rcmd' ] )(
		'neutralizes formula injection in fields starting with %j',
		( payload ) => {
			const csv = generateCommissionsCsv( [], [], payoutWithProductName( payload ) );
			// The injected field is prefixed with a single quote so spreadsheets treat it as a literal string.
			expect( csv ).toContain( `'${ payload }` );
		}
	);

	it( 'does not alter values that do not start with a formula trigger', () => {
		const csv = generateCommissionsCsv( [], [], payoutWithProductName( 'Pro Plan' ) );
		expect( csv ).toContain( 'Pro Plan' );
		expect( csv ).not.toContain( "'Pro Plan" );
	} );

	it( 'does not prefix a lone trigger character used as a placeholder', () => {
		const csv = generateCommissionsCsv( [], [], payoutWithProductName( '-' ) );
		expect( csv ).not.toContain( "'-" );
	} );

	it( 'still quotes and escapes fields containing commas and quotes', () => {
		const csv = generateCommissionsCsv( [], [], payoutWithProductName( 'Plan "A", annual' ) );
		expect( csv ).toContain( '"Plan ""A"", annual"' );
	} );

	// The payout endpoint can report an alternative product id while the referrals endpoint
	// reports the canonical one, so matching must bridge every id variant.
	const catalogProduct = {
		name: 'WordPress.com Business',
		slug: 'wpcom-hosting',
		family_slug: 'wpcom-hosting',
		product_id: 1018,
		alternative_product_id: 9999,
		monthly_alternative_product_id: 3301,
		yearly_alternative_product_id: 3300,
	} as unknown as APIProductFamilyProduct;

	const referral = {
		id: 12345,
		client: { id: 12345, email: 'client@example.com' },
		purchases: [ { product_id: 1018, status: 'active', quantity: 2 } ],
		purchaseStatuses: [ 'active' ],
		referralStatuses: [ 'active' ],
		referrals: [],
	} as unknown as Referral;

	function payoutForProductId( productId: number ): ReferralCommissionPayoutResponse {
		return {
			total_amount: 100,
			total_commission: 20,
			start_date: '2024-01-01',
			end_date: '2024-01-31',
			next_payout_date: '2024-03-02',
			client_data: [
				{
					client_user_id: 12345,
					email: 'client@example.com',
					total_amount: 100,
					total_commission: 20,
					products: [
						{
							product_id: productId,
							product_name: 'WordPress.com Business',
							total_amount: 100,
							total_commission: 20,
							invoices: [ { payment_date: '2024-01-15', paid_amount: 100, commission_amount: 20 } ],
						},
					],
				},
			],
		};
	}

	it.each( [
		[ 'monthly alternative', 3301 ],
		[ 'yearly alternative', 3300 ],
		[ 'legacy alternative', 9999 ],
	] )(
		'matches a purchase when the payout reports the %s product id',
		( _label, payoutProductId ) => {
			const csv = generateCommissionsCsv(
				[ referral ],
				[ catalogProduct ],
				payoutForProductId( payoutProductId as number ),
				true
			);
			expect( csv ).toContain( 'WordPress.com Business' );
			// 20% (from the matched product's hosting slug) and quantity 2 (from the matched purchase)
			// only appear when the row came from a successful match rather than being dropped.
			expect( csv ).toContain( '20%' );
			expect( csv ).toContain( 'WordPress.com Business,2,' );
		}
	);

	it( 'drops the row in the single-client view when no product matches', () => {
		const csv = generateCommissionsCsv(
			[ referral ],
			[ catalogProduct ],
			payoutForProductId( 4242 ),
			true
		);
		expect( csv ).not.toContain( 'WordPress.com Business' );
	} );
} );
