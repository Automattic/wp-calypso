import { referralEmailPreviewQuery } from '../agency-referrals';

const params = { product_ids: [ 2113 ], greeting_line: 'Hi', term_pricing: 'yearly' as const };
const dataUrl = 'data:image/png;base64,' + 'A'.repeat( 5000 );

describe( 'referralEmailPreviewQuery', () => {
	it( 'keeps a picked logo’s data URL out of the stored cache', () => {
		const query = referralEmailPreviewQuery( 1, { ...params, logo_url: dataUrl } );

		expect( JSON.stringify( query.queryKey ) ).not.toContain( 'base64' );
		expect( query.meta?.persist ).toBe( false );
	} );

	it( 'tells two logos apart', () => {
		const first = referralEmailPreviewQuery( 1, { ...params, logo_url: dataUrl } );
		const second = referralEmailPreviewQuery( 1, { ...params, logo_url: dataUrl + 'B' } );

		expect( first.queryKey ).not.toEqual( second.queryKey );
	} );
} );
