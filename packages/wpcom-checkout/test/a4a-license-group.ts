import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { groupA4ALicenses, isA4AAgencyPurchaseProduct } from '../src/a4a-license-group';
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
	test( "folds an agency's licenses of one product into one line where the first one was", () => {
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

	test( 'keeps a product bought once as a plain line', () => {
		const only = buildLicense( 'a' );
		expect( groupA4ALicenses( asEntries( [ only ] ) ) ).toEqual( [
			{ type: 'product', product: only },
		] );
	} );

	test( 'keeps licenses for different sites apart', () => {
		const one = buildLicense( 'a', { extra: { a4a_pressable_site_domain: 'one.example.com' } } );
		const two = buildLicense( 'b', { extra: { a4a_pressable_site_domain: 'two.example.com' } } );
		expect( groupA4ALicenses( asEntries( [ one, two ] ) ) ).toEqual( asEntries( [ one, two ] ) );
	} );

	test( "leaves a client's referral cart and other carts as they are", () => {
		const referralOne = buildLicense( 'a', { extra: { referral_id: 7 } } );
		const referralTwo = buildLicense( 'b', { extra: { referral_id: 7 } } );
		const plan = { ...getEmptyResponseCartProduct(), uuid: 'c', product_slug: 'business-bundle' };
		const planAgain = {
			...getEmptyResponseCartProduct(),
			uuid: 'd',
			product_slug: 'business-bundle',
		};

		expect( isA4AAgencyPurchaseProduct( referralOne ) ).toBe( false );
		expect(
			groupA4ALicenses( asEntries( [ referralOne, referralTwo, plan, planAgain ] ) )
		).toEqual( asEntries( [ referralOne, referralTwo, plan, planAgain ] ) );
	} );
} );
