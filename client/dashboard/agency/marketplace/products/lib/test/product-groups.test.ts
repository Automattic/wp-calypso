import {
	getItemId,
	getItemProducts,
	getMarketplaceProducts,
	getProductSections,
} from '../product-groups';
import { EXCLUDED_PRODUCT_SLUGS, FEATURED_PRODUCT_SLUGS } from '../product-slugs';
import type { AgencyProduct } from '@automattic/api-core';

let nextId = 1;
const product = ( slug: string, family_slug: string, name = slug ): AgencyProduct => ( {
	name,
	slug,
	product_id: nextId++,
	currency: 'USD',
	family_slug,
} );

describe( 'getMarketplaceProducts', () => {
	test( 'drops hosting plans and the products the classic list hides', () => {
		const products = [
			product( 'jetpack-boost', 'jetpack-products' ),
			product( 'wpcom-hosting-business', 'wpcom-hosting' ),
			product( 'pressable-signature-1', 'pressable-hosting' ),
			product( EXCLUDED_PRODUCT_SLUGS[ 0 ], 'jetpack-products' ),
		];
		expect( getMarketplaceProducts( products ).map( ( { slug } ) => slug ) ).toEqual( [
			'jetpack-boost',
		] );
	} );
} );

describe( 'getProductSections', () => {
	const securityT1 = product( 'jetpack-security-t1', 'jetpack-packs', 'Jetpack Security (10GB)' );
	const securityT2 = product( 'jetpack-security-t2', 'jetpack-packs', 'Jetpack Security (1TB)' );
	const complete = product( 'jetpack-complete', 'jetpack-packs', 'Jetpack Complete' );
	const scan = product( 'jetpack-scan', 'jetpack-products', 'Jetpack Scan' );
	const boost = product( 'jetpack-boost', 'jetpack-products', 'Jetpack Boost' );
	const storage1tb = product(
		'jetpack-backup-addon-storage-1tb-monthly',
		'jetpack-backup-storage',
		'1TB'
	);
	const storage10gb = product(
		'jetpack-backup-addon-storage-10gb-monthly',
		'jetpack-backup-storage',
		'10GB'
	);
	const featured = FEATURED_PRODUCT_SLUGS.map( ( slug ) =>
		product( slug, 'woocommerce-products', slug )
	);
	const bookings = product(
		'woocommerce-bookings',
		'woocommerce-products',
		'WooCommerce Bookings'
	);
	const sites10 = product( 'pressable-addon-sites-10', 'pressable-addon', 'Pressable 10 sites' );
	const sites5 = product( 'pressable-addon-sites-5', 'pressable-addon', 'Pressable 5 sites' );

	const sections = getProductSections( [
		scan,
		securityT2,
		bookings,
		boost,
		storage1tb,
		complete,
		securityT1,
		storage10gb,
		sites10,
		sites5,
		...[ ...featured ].reverse(),
	] );
	const section = ( key: string ) => sections.find( ( item ) => item.key === key );

	test( 'keeps the classic section order and skips empty sections', () => {
		expect( sections.map( ( { key } ) => key ) ).toEqual( [
			'featured',
			'woocommerce',
			'jetpack-plans',
			'jetpack-products',
			'backup-addons',
			'pressable-addons',
		] );
		expect( getProductSections( [ scan ] ).map( ( { key } ) => key ) ).toEqual( [
			'jetpack-products',
		] );
	} );

	test( 'orders featured products as hand-picked', () => {
		expect( section( 'featured' )?.items.map( getItemId ) ).toEqual( FEATURED_PRODUCT_SLUGS );
	} );

	test( 'sorts WooCommerce extensions and Jetpack products by name', () => {
		expect( section( 'woocommerce' )?.items.map( getItemId ) ).toEqual( [
			'woocommerce-bookings',
			...[ ...FEATURED_PRODUCT_SLUGS ].sort(),
		] );
		expect( section( 'jetpack-products' )?.items.map( getItemId ) ).toEqual( [
			'jetpack-boost',
			'jetpack-scan',
		] );
	} );

	test( 'folds size tiers of the same plan into one card', () => {
		const plans = section( 'jetpack-plans' )?.items ?? [];
		expect( plans.map( getItemId ) ).toEqual( [ 'jetpack-security-t2', 'jetpack-complete' ] );
		expect( getItemProducts( plans[ 0 ] ).map( ( { slug } ) => slug ) ).toEqual( [
			'jetpack-security-t2',
			'jetpack-security-t1',
		] );
		expect( getItemProducts( plans[ 1 ] ) ).toEqual( [ complete ] );
	} );

	test( 'sorts backup add-ons by product id and Pressable add-ons naturally by name', () => {
		expect( section( 'backup-addons' )?.items.map( getItemId ) ).toEqual( [
			'jetpack-backup-addon-storage-1tb-monthly',
			'jetpack-backup-addon-storage-10gb-monthly',
		] );
		expect( section( 'pressable-addons' )?.items.map( getItemId ) ).toEqual( [
			'pressable-addon-sites-5',
			'pressable-addon-sites-10',
		] );
	} );
} );
