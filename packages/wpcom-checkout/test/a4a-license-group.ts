import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { groupA4ALicenses } from '../src/a4a-license-group';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

function buildLicense(
	uuid: string,
	{
		slug = 'jetpack_wc_composite_products_yearly',
		productId = 2713,
		extra = {},
	}: { slug?: string; productId?: number; extra?: ResponseCartProduct[ 'extra' ] } = {}
): ResponseCartProduct {
	return {
		...getEmptyResponseCartProduct(),
		uuid,
		product_slug: slug,
		product_id: productId,
		extra: { isA4ASitelessCheckout: true, agency_id: 1, ...extra },
	};
}

const asEntries = ( products: ResponseCartProduct[] ) =>
	products.map( ( product ) => ( { type: 'product' as const, product } ) );

describe( 'groupA4ALicenses', () => {
	test( 'folds the licenses of one product into one line where the first one was', () => {
		const first = buildLicense( 'a', { extra: { cart_item_index: 0 } } );
		const other = buildLicense( 'b', {
			slug: 'jetpack_wc_table_rate_shipping_yearly',
			productId: 2728,
		} );
		const second = buildLicense( 'c', { extra: { cart_item_index: 1 } } );

		expect( groupA4ALicenses( asEntries( [ first, other, second ] ) ) ).toEqual( [
			{
				type: 'a4a-licenses',
				key: 'jetpack_wc_composite_products_yearly:2713:',
				products: [ first, second ],
			},
			{ type: 'product', product: other },
		] );
	} );

	test( "groups a client's referral licenses too", () => {
		const one = buildLicense( 'a', { extra: { referral_id: 7, cart_item_index: 0 } } );
		const two = buildLicense( 'b', { extra: { referral_id: 7, cart_item_index: 1 } } );

		expect( groupA4ALicenses( asEntries( [ one, two ] ) ) ).toEqual( [
			{
				type: 'a4a-licenses',
				key: 'jetpack_wc_composite_products_yearly:2713:',
				products: [ one, two ],
			},
		] );
	} );

	test( 'keeps licenses for different sites apart', () => {
		const one = buildLicense( 'a', { extra: { a4a_pressable_site_domain: 'one.example.com' } } );
		const two = buildLicense( 'b', { extra: { a4a_pressable_site_domain: 'two.example.com' } } );
		expect( groupA4ALicenses( asEntries( [ one, two ] ) ) ).toEqual( asEntries( [ one, two ] ) );
	} );

	test( 'leaves carts outside A4A as they are', () => {
		const plan = { ...getEmptyResponseCartProduct(), uuid: 'a', product_slug: 'business-bundle' };
		const planAgain = { ...plan, uuid: 'b' };
		expect( groupA4ALicenses( asEntries( [ plan, planAgain ] ) ) ).toEqual(
			asEntries( [ plan, planAgain ] )
		);
	} );
} );
