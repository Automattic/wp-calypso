import { generateCommissionsCsv } from '../generate-commissions-csv';
import type { ReferralCommissionPayoutResponse } from '../../types';

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
} );
