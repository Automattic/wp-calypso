import {
	getPreparedCheckoutRequest,
	PREPARE_QUERY_ARG,
	SKIP_ACTIVE_CART_QUERY_ARG,
} from '../get-prepared-checkout-request';
import { PRESSABLE_TITAN_SOURCE_ID } from '../sources';

const SIGNED =
	'agency_id=256533027&domain=titantest7.blog&plan=standard&quantity=2&signature=abc123';

describe( 'getPreparedCheckoutRequest', () => {
	it( 'returns none when neither prepare nor skip_active_cart is present', () => {
		expect( getPreparedCheckoutRequest( '?product_slug=jetpack-backup' ) ).toEqual( {
			status: 'none',
		} );
		expect( getPreparedCheckoutRequest( '' ) ).toEqual( { status: 'none' } );
	} );

	it( 'returns reload when only skip_active_cart=1 is present', () => {
		expect( getPreparedCheckoutRequest( `?${ SKIP_ACTIVE_CART_QUERY_ARG }=1` ) ).toEqual( {
			status: 'reload',
		} );
	} );

	it( 'treats skip_active_cart with any other value as absent', () => {
		expect( getPreparedCheckoutRequest( `?${ SKIP_ACTIVE_CART_QUERY_ARG }=0` ) ).toEqual( {
			status: 'none',
		} );
	} );

	it( 'accepts a query string without the leading question mark (page.js querystring)', () => {
		expect( getPreparedCheckoutRequest( `${ SKIP_ACTIVE_CART_QUERY_ARG }=1` ) ).toEqual( {
			status: 'reload',
		} );
	} );

	it( 'returns unknown_source for a prepare value that is not registered', () => {
		expect( getPreparedCheckoutRequest( `?${ PREPARE_QUERY_ARG }=nope&${ SIGNED }` ) ).toEqual( {
			status: 'unknown_source',
			sourceId: 'nope',
		} );
	} );

	it( 'returns incomplete listing the missing required params', () => {
		const result = getPreparedCheckoutRequest(
			`?${ PREPARE_QUERY_ARG }=${ PRESSABLE_TITAN_SOURCE_ID }&agency_id=1&domain=x.blog&signature=`
		);
		expect( result ).toMatchObject( {
			status: 'incomplete',
			source: { id: PRESSABLE_TITAN_SOURCE_ID },
			missing: [ 'quantity', 'signature' ],
		} );
	} );

	it( 'returns ready with the raw string params and omits absent optional params', () => {
		const result = getPreparedCheckoutRequest(
			`?${ PREPARE_QUERY_ARG }=${ PRESSABLE_TITAN_SOURCE_ID }&${ SIGNED }`
		);
		expect( result ).toEqual( {
			status: 'ready',
			request: {
				source: expect.objectContaining( { endpoint: '/agency/pressable/titan-checkout' } ),
				params: {
					agency_id: '256533027',
					domain: 'titantest7.blog',
					plan: 'standard',
					quantity: '2',
					signature: 'abc123',
				},
			},
		} );
	} );

	it( 'includes is_trial when present and ignores unrelated params', () => {
		const result = getPreparedCheckoutRequest(
			`?${ PREPARE_QUERY_ARG }=${ PRESSABLE_TITAN_SOURCE_ID }&${ SIGNED }&is_trial=1&utm_source=x`
		);
		expect( result ).toEqual( {
			status: 'ready',
			request: {
				source: expect.anything(),
				params: {
					agency_id: '256533027',
					domain: 'titantest7.blog',
					plan: 'standard',
					quantity: '2',
					signature: 'abc123',
					is_trial: '1',
				},
			},
		} );
	} );

	it( 'prefers prepare over skip_active_cart when both are present', () => {
		expect(
			getPreparedCheckoutRequest(
				`?${ SKIP_ACTIVE_CART_QUERY_ARG }=1&${ PREPARE_QUERY_ARG }=${ PRESSABLE_TITAN_SOURCE_ID }&${ SIGNED }`
			)
		).toMatchObject( { status: 'ready' } );
	} );
} );
