import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { mergeIdenticalLineItems } from '../src/merge-identical-line-items';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

function buildLine(
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
		extra: { mergeIdenticalItems: true, ...extra },
	};
}

const asEntries = ( products: ResponseCartProduct[] ) =>
	products.map( ( product ) => ( { type: 'product' as const, product } ) );

describe( 'mergeIdenticalLineItems', () => {
	test( 'merges lines that differ only by their position, where the first one was', () => {
		// The cart endpoint numbers every line with `add_sequence`.
		const first = buildLine( 'a', { extra: { cart_item_index: 0, add_sequence: 1 } } );
		const other = buildLine( 'b', {
			slug: 'jetpack_wc_table_rate_shipping_yearly',
			productId: 2728,
			extra: { add_sequence: 2 },
		} );
		const second = buildLine( 'c', { extra: { cart_item_index: 1, add_sequence: 3 } } );

		const [ merged, rest ] = mergeIdenticalLineItems( asEntries( [ first, other, second ] ) );
		expect( merged ).toMatchObject( { type: 'merged', products: [ first, second ] } );
		expect( rest ).toEqual( { type: 'product', product: other } );
	} );

	test( 'keeps lines apart when anything else differs', () => {
		const one = buildLine( 'a', { extra: { a4a_pressable_site_domain: 'one.example.com' } } );
		const two = buildLine( 'b', { extra: { a4a_pressable_site_domain: 'two.example.com' } } );
		expect( mergeIdenticalLineItems( asEntries( [ one, two ] ) ) ).toEqual(
			asEntries( [ one, two ] )
		);
	} );

	test( 'keeps each term of a product on its own line', () => {
		const monthly = { slug: 'jetpack_wc_composite_products_monthly', productId: 2714 };
		const [ yearlyLine, monthlyLine ] = mergeIdenticalLineItems(
			asEntries( [
				buildLine( 'a' ),
				buildLine( 'b', monthly ),
				buildLine( 'c' ),
				buildLine( 'd', monthly ),
			] )
		);
		expect( yearlyLine ).toMatchObject( {
			type: 'merged',
			products: [ { uuid: 'a' }, { uuid: 'c' } ],
		} );
		expect( monthlyLine ).toMatchObject( {
			type: 'merged',
			products: [ { uuid: 'b' }, { uuid: 'd' } ],
		} );
	} );

	test( 'leaves identical lines apart unless they ask to be merged', () => {
		const plan = { ...getEmptyResponseCartProduct(), uuid: 'a', product_slug: 'business-bundle' };
		const planAgain = { ...plan, uuid: 'b' };
		expect( mergeIdenticalLineItems( asEntries( [ plan, planAgain ] ) ) ).toEqual(
			asEntries( [ plan, planAgain ] )
		);
	} );
} );
