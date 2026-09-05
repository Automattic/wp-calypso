import { buildCheckoutCartProducts } from '../build-checkout-cart-products';
import type { ShoppingCartItem } from '../../types';

const buildItem = ( overrides: Partial< ShoppingCartItem > = {} ): ShoppingCartItem => ( {
	name: 'Jetpack Backup',
	slug: 'jetpack-backup',
	product_id: 2100,
	currency: 'USD',
	amount: '10',
	price_interval: 'day',
	family_slug: 'jetpack-packs',
	supported_bundles: [],
	quantity: 1,
	...overrides,
} );

describe( 'buildCheckoutCartProducts', () => {
	it( 'creates one cart product per single-quantity item', () => {
		const result = buildCheckoutCartProducts( [ buildItem() ], 99 );
		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toMatchObject( {
			product_id: 2100,
			product_slug: 'jetpack-backup',
			extra: { isA4ASitelessCheckout: true, agency_id: 99, cart_item_index: 1 },
		} );
	} );

	it( 'assigns globally-unique, 1-based cart_item_index across duplicate items', () => {
		const item = buildItem();
		const result = buildCheckoutCartProducts( [ item, item, item ], 99 );
		expect( result.map( ( p ) => p.extra.cart_item_index ) ).toEqual( [ 1, 2, 3 ] );
	} );

	it( 'never assigns a cart_item_index of 0', () => {
		const item = buildItem();
		const result = buildCheckoutCartProducts( [ item, item ], 99 );
		expect( result.every( ( p ) => p.extra.cart_item_index > 0 ) ).toBe( true );
	} );

	it( 'expands a bundle-quantity item into that many lines with unique indexes', () => {
		const result = buildCheckoutCartProducts( [ buildItem( { quantity: 3 } ) ], 99 );
		expect( result.map( ( p ) => p.extra.cart_item_index ) ).toEqual( [ 1, 2, 3 ] );
	} );

	it( 'keeps indexes unique across a mix of duplicate and bundle items', () => {
		const backup = buildItem();
		const scan = buildItem( { slug: 'jetpack-scan', quantity: 2 } );
		const result = buildCheckoutCartProducts( [ backup, scan, backup ], 99 );
		// backup(1) + scan(2) + backup(1) = 4 lines, indexes 1..4
		expect( result.map( ( p ) => p.extra.cart_item_index ) ).toEqual( [ 1, 2, 3, 4 ] );
	} );

	it( 'prefers the alternative product id when present', () => {
		const result = buildCheckoutCartProducts(
			[ buildItem( { alternative_product_id: 5555 } ) ],
			99
		);
		expect( result[ 0 ].product_id ).toBe( 5555 );
	} );

	it( 'adds the pressable site domain when present', () => {
		const result = buildCheckoutCartProducts( [ buildItem( { site_domain: 'example.com' } ) ], 99 );
		expect( result[ 0 ].extra.a4a_pressable_site_domain ).toBe( 'example.com' );
	} );

	it( 'treats a zero or negative quantity as a single line', () => {
		const result = buildCheckoutCartProducts( [ buildItem( { quantity: 0 } ) ], 99 );
		expect( result ).toHaveLength( 1 );
	} );
} );
