import { relabelWooCommerceAsStoreSetup } from '../relabel-woocommerce-store-setup';
import type { AdminMenuItem } from 'calypso/state/admin-menu/types';

const item = ( overrides: Partial< AdminMenuItem > ): AdminMenuItem => ( {
	slug: 'example',
	title: 'Example',
	type: 'menu-item',
	...overrides,
} );

describe( 'relabelWooCommerceAsStoreSetup()', () => {
	it( 'relabels the WooCommerce API item to "Store setup"', () => {
		const [ relabeled ] = relabelWooCommerceAsStoreSetup( [
			item( { slug: 'woocommerce', title: 'WooCommerce' } ),
		] );

		expect( relabeled.title ).toBe( 'Store setup' );
	} );

	it( 'relabels the WooCommerce fallback item (woo-php) to "Store setup"', () => {
		const [ relabeled ] = relabelWooCommerceAsStoreSetup( [
			item( { slug: 'woo-php', title: 'WooCommerce' } ),
		] );

		expect( relabeled.title ).toBe( 'Store setup' );
	} );

	it( 'preserves other menu items', () => {
		const stats = item( { slug: 'stats', title: 'Stats' } );
		const [ relabeled ] = relabelWooCommerceAsStoreSetup( [ stats ] );

		expect( relabeled ).toBe( stats );
		expect( relabeled.title ).toBe( 'Stats' );
	} );

	it( 'returns an empty array for non-array input', () => {
		expect( relabelWooCommerceAsStoreSetup( null ) ).toEqual( [] );
		expect( relabelWooCommerceAsStoreSetup( undefined ) ).toEqual( [] );
	} );
} );
