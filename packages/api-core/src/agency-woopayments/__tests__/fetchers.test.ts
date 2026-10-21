import nock from 'nock';
import { fetchAgencyWooPaymentsCommissionsReport, fetchAgencyWooPaymentsData } from '..';

const BASE = 'https://public-api.wordpress.com';

describe( 'fetchAgencyWooPaymentsData', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches the agency WooPayments commissions data', async () => {
		const payload = { data: { total: { payout: 10, tpv: 100, transactions: 2 } }, status: 'ok' };
		const scope = nock( BASE )
			.get( '/wpcom/v2/agency/123/woocommerce/woopayments' )
			.reply( 200, payload );

		await expect( fetchAgencyWooPaymentsData( 123 ) ).resolves.toEqual( payload );
		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'fetchAgencyWooPaymentsCommissionsReport', () => {
	afterEach( () => nock.cleanAll() );

	it( 'requests the per-site report with the csv format query param', async () => {
		const payload = { data: 'a,b,c', filename: 'report.csv' };
		const scope = nock( BASE )
			.get( '/wpcom/v2/agency/123/woocommerce/woopayments/456' )
			.query( { format: 'csv' } )
			.reply( 200, payload );

		await expect( fetchAgencyWooPaymentsCommissionsReport( 123, 456 ) ).resolves.toEqual( payload );
		expect( scope.isDone() ).toBe( true );
	} );
} );
