import { __ } from '@wordpress/i18n';
import { isPressableAddon, isWooCommerceProduct } from './product-categories';
import {
	BACKUP_STORAGE_FAMILY_SLUG,
	EXCLUDED_PRODUCT_SLUGS,
	FEATURED_PRODUCT_SLUGS,
	JETPACK_PACKS_FAMILY_SLUG,
} from './product-slugs';
import type { AgencyProduct } from '@automattic/api-core';

// Some Jetpack products come in size tiers (10GB / 1TB) that the classic list
// folds into one card with a variant picker.
const MERGEABLE_SLUG_PREFIXES = [ 'jetpack-security', 'jetpack-backup' ];

// One card: a single product, or a set of size variants of the same product.
export type ProductListItem = AgencyProduct | AgencyProduct[];

export type ProductSectionKey =
	| 'featured'
	| 'woocommerce'
	| 'jetpack-plans'
	| 'jetpack-products'
	| 'backup-addons'
	| 'pressable-addons';

export interface ProductSection {
	key: ProductSectionKey;
	title: string;
	description?: string;
	brand?: 'jetpack' | 'woocommerce' | 'pressable';
	items: ProductListItem[];
}

const isHostingPlan = ( product: AgencyProduct ) =>
	product.family_slug === 'wpcom-hosting' || product.family_slug === 'pressable-hosting';

// The marketplace catalog: hosting plans live on the Hosting page.
export function getMarketplaceProducts( products: AgencyProduct[] ): AgencyProduct[] {
	return products.filter(
		( product ) => ! EXCLUDED_PRODUCT_SLUGS.includes( product.slug ) && ! isHostingPlan( product )
	);
}

export const getItemProducts = ( item: ProductListItem ) =>
	Array.isArray( item ) ? item : [ item ];

export const getItemId = ( item: ProductListItem ) => getItemProducts( item )[ 0 ].slug;

function mergeVariants( products: AgencyProduct[] ): ProductListItem[] {
	const merged = MERGEABLE_SLUG_PREFIXES.map( ( prefix ) =>
		products.filter( ( { slug } ) => slug.startsWith( prefix ) )
	)
		.filter( ( variants ) => variants.length > 0 )
		.map( ( variants ) => ( variants.length === 1 ? variants[ 0 ] : variants ) );
	const rest = products.filter(
		( { slug } ) => ! MERGEABLE_SLUG_PREFIXES.some( ( prefix ) => slug.startsWith( prefix ) )
	);
	return [ ...merged, ...rest ];
}

const byName = ( locale?: string ) => ( a: ProductListItem, b: ProductListItem ) =>
	getItemProducts( a )[ 0 ].name.localeCompare( getItemProducts( b )[ 0 ].name, locale );

const isJetpackProduct = ( product: AgencyProduct ) =>
	! isWooCommerceProduct( product ) &&
	! isPressableAddon( product ) &&
	product.family_slug !== JETPACK_PACKS_FAMILY_SLUG &&
	product.family_slug !== BACKUP_STORAGE_FAMILY_SLUG;

// The classic dashboard's fixed section order and copy.
// `locale` is the user's Intl language tag, so names sort by their language
// rather than the browser's.
export function getProductSections( products: AgencyProduct[], locale?: string ): ProductSection[] {
	const featured = FEATURED_PRODUCT_SLUGS.map( ( slug ) =>
		products.find( ( product ) => product.slug === slug )
	).filter( ( product ): product is AgencyProduct => !! product );

	const sections: ProductSection[] = [
		{
			key: 'featured',
			title: __( 'Featured products' ),
			items: featured,
		},
		{
			key: 'woocommerce',
			title: __( 'WooCommerce extensions' ),
			description: __(
				'Explore the tools and integrations you need to grow your client’s Woo store.'
			),
			brand: 'woocommerce',
			items: products.filter( isWooCommerceProduct ).sort( byName( locale ) ),
		},
		{
			key: 'jetpack-plans',
			title: __( 'Jetpack plans' ),
			description: __(
				'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
			),
			brand: 'jetpack',
			items: mergeVariants(
				products.filter( ( product ) => product.family_slug === JETPACK_PACKS_FAMILY_SLUG )
			),
		},
		{
			key: 'jetpack-products',
			title: __( 'Jetpack products' ),
			description: __(
				'Mix and match powerful security, performance, and growth tools for your sites.'
			),
			brand: 'jetpack',
			items: mergeVariants( products.filter( isJetpackProduct ) ).sort( byName( locale ) ),
		},
		{
			key: 'backup-addons',
			title: __( 'Jetpack VaultPress Backup add-ons' ),
			description: __( 'Add additional storage to your current VaultPress Backup plans.' ),
			brand: 'jetpack',
			items: products
				.filter( ( product ) => product.family_slug === BACKUP_STORAGE_FAMILY_SLUG )
				.sort( ( a, b ) => a.product_id - b.product_id ),
		},
		{
			key: 'pressable-addons',
			title: __( 'Pressable add-ons' ),
			description: __( 'Increase your plan limits and features with plan add-ons.' ),
			brand: 'pressable',
			items: products
				.filter( isPressableAddon )
				.sort( ( a, b ) => a.name.localeCompare( b.name, locale, { numeric: true } ) ),
		},
	];

	return sections.filter( ( section ) => section.items.length > 0 );
}
