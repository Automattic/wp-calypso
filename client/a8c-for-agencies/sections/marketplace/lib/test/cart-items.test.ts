import {
	addCartItem,
	decrementCartItem,
	groupCartItems,
	isSameCartItem,
	removeCartItemGroup,
	setCartItemCount,
} from '../cart-items';
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

describe( 'cart-items', () => {
	describe( 'addCartItem', () => {
		it( 'appends a product to an empty cart', () => {
			const item = buildItem();
			expect( addCartItem( [], item ) ).toEqual( [ item ] );
		} );

		it( 'appends another copy when the same product is already in the cart', () => {
			const item = buildItem();
			const result = addCartItem( [ item ], item );
			expect( result ).toHaveLength( 2 );
			expect( result ).toEqual( [ item, item ] );
		} );

		it( 'does not mutate the original cart array', () => {
			const cart = [ buildItem() ];
			addCartItem( cart, buildItem() );
			expect( cart ).toHaveLength( 1 );
		} );
	} );

	describe( 'isSameCartItem', () => {
		it( 'matches items with the same slug and quantity', () => {
			expect( isSameCartItem( buildItem(), buildItem() ) ).toBe( true );
		} );

		it( 'distinguishes different slugs', () => {
			expect( isSameCartItem( buildItem(), buildItem( { slug: 'jetpack-scan' } ) ) ).toBe( false );
		} );

		it( 'distinguishes different bundle quantities', () => {
			expect( isSameCartItem( buildItem( { quantity: 1 } ), buildItem( { quantity: 5 } ) ) ).toBe(
				false
			);
		} );

		it( 'distinguishes different site domains', () => {
			expect(
				isSameCartItem(
					buildItem( { site_domain: 'a.com' } ),
					buildItem( { site_domain: 'b.com' } )
				)
			).toBe( false );
		} );
	} );

	describe( 'groupCartItems', () => {
		it( 'groups duplicate items with a count and preserves order', () => {
			const backup = buildItem();
			const scan = buildItem( { slug: 'jetpack-scan', name: 'Jetpack Scan' } );
			const result = groupCartItems( [ backup, scan, backup ] );
			expect( result ).toEqual( [
				{ item: backup, count: 2 },
				{ item: scan, count: 1 },
			] );
		} );
	} );

	describe( 'decrementCartItem', () => {
		it( 'removes a single instance of a duplicated item', () => {
			const item = buildItem();
			const result = decrementCartItem( [ item, item ], item );
			expect( result ).toEqual( [ item ] );
		} );

		it( 'leaves other items untouched', () => {
			const backup = buildItem();
			const scan = buildItem( { slug: 'jetpack-scan' } );
			const result = decrementCartItem( [ backup, scan, backup ], backup );
			expect( result ).toEqual( [ scan, backup ] );
		} );
	} );

	describe( 'removeCartItemGroup', () => {
		it( 'removes every instance of the matching item', () => {
			const backup = buildItem();
			const scan = buildItem( { slug: 'jetpack-scan' } );
			const result = removeCartItemGroup( [ backup, scan, backup ], backup );
			expect( result ).toEqual( [ scan ] );
		} );
	} );

	describe( 'setCartItemCount', () => {
		it( 'appends copies to reach the target count', () => {
			const item = buildItem();
			const result = setCartItemCount( [ item ], item, 3 );
			expect( result ).toEqual( [ item, item, item ] );
		} );

		it( 'adds copies to an empty cart', () => {
			const item = buildItem();
			const result = setCartItemCount( [], item, 2 );
			expect( result ).toEqual( [ item, item ] );
		} );

		it( 'drops extra copies to reach a smaller target count', () => {
			const item = buildItem();
			const result = setCartItemCount( [ item, item, item ], item, 1 );
			expect( result ).toEqual( [ item ] );
		} );

		it( 'removes the group when the target count is zero', () => {
			const item = buildItem();
			const result = setCartItemCount( [ item, item ], item, 0 );
			expect( result ).toEqual( [] );
		} );

		it( 'returns the same array reference when the count is unchanged', () => {
			const cart = [ buildItem(), buildItem() ];
			expect( setCartItemCount( cart, buildItem(), 2 ) ).toBe( cart );
		} );

		it( 'leaves other items untouched when growing', () => {
			const backup = buildItem();
			const scan = buildItem( { slug: 'jetpack-scan' } );
			const result = setCartItemCount( [ backup, scan ], backup, 2 );
			expect( result ).toEqual( [ backup, scan, backup ] );
		} );

		it( 'leaves other items untouched when shrinking', () => {
			const backup = buildItem();
			const scan = buildItem( { slug: 'jetpack-scan' } );
			const result = setCartItemCount( [ backup, scan, backup ], backup, 1 );
			expect( result ).toEqual( [ scan, backup ] );
		} );

		it( 'does not mutate the original cart array', () => {
			const cart = [ buildItem() ];
			setCartItemCount( cart, buildItem(), 3 );
			expect( cart ).toHaveLength( 1 );
		} );
	} );
} );
