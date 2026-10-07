import {
	getFeaturedProducts,
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

describe( 'getFeaturedProducts', () => {
	test( 'keeps the hand-picked order and skips products the agency cannot buy', () => {
		const featured = FEATURED_PRODUCT_SLUGS.slice( 1 ).map( ( slug ) =>
			product( slug, 'woocommerce-products' )
		);
		expect( getFeaturedProducts( [ ...featured ].reverse() ).map( getItemId ) ).toEqual(
			FEATURED_PRODUCT_SLUGS.slice( 1 )
		);
	} );
} );

describe( 'getProductSections', () => {
	const securityT1 = product( 'jetpack-security-t1', 'jetpack-packs', 'Jetpack Security (10GB)' );
	const securityT2 = product( 'jetpack-security-t2', 'jetpack-packs', 'Jetpack Security (1TB)' );
	const complete = product( 'jetpack-complete', 'jetpack-packs', 'Jetpack Complete' );
	const scan = product( 'jetpack-scan', 'jetpack-products', 'Jetpack Scan' );
	const backup = product( 'jetpack-backup-t1', 'jetpack-products', 'Jetpack VaultPress Backup' );
	const storage10gb = product(
		'jetpack-backup-addon-storage-10gb-monthly',
		'jetpack-backup-storage',
		'Jetpack VaultPress Backup Add-on Storage (10GB)'
	);
	const woopayments = product( 'woocommerce-woopayments', 'woocommerce-products', 'WooPayments' );
	const sites5 = product( 'pressable-addon-sites-5', 'pressable-addon', 'Pressable 5 sites' );

	const sections = getProductSections( [
		scan,
		securityT2,
		complete,
		securityT1,
		backup,
		storage10gb,
		woopayments,
		sites5,
	] );
	const section = ( key: string ) => sections.find( ( item ) => item.key === key );

	test( 'keeps the category order, ends with the uncategorised products, and skips empty jobs', () => {
		expect( sections.map( ( { key } ) => key ) ).toEqual( [
			'payments',
			'security',
			'store-management',
			'other',
		] );
	} );

	test( 'shows a product in every job it does', () => {
		expect( section( 'payments' )?.items.map( getItemId ) ).toEqual( [
			'woocommerce-woopayments',
		] );
		expect( section( 'store-management' )?.items.map( getItemId ) ).toEqual( [
			'woocommerce-woopayments',
		] );
	} );

	test( 'folds size tiers into one card but keeps each backup add-on its own', () => {
		const security = section( 'security' )?.items ?? [];
		const tiers = section( 'other' )?.items.find(
			( item ) => getItemId( item ) === 'jetpack-security-t2'
		);
		expect( tiers && getItemProducts( tiers ).map( ( { slug } ) => slug ) ).toEqual( [
			'jetpack-security-t2',
			'jetpack-security-t1',
		] );
		expect( security.map( getItemId ) ).toContain( 'jetpack-backup-addon-storage-10gb-monthly' );
		expect( security.map( getItemId ) ).toContain( 'jetpack-backup-t1' );
	} );

	test( 'puts products with no job category last', () => {
		expect( section( 'other' )?.items.map( getItemId ) ).toEqual( [
			'jetpack-complete',
			'jetpack-security-t2',
			'pressable-addon-sites-5',
		] );
	} );
} );
