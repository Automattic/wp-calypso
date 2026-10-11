import { PRESSABLE_HOSTING_FAMILY_SLUG, WPCOM_HOSTING_FAMILY_SLUG } from '../../lib/wpcom-hosting';
import { getCategoryLabels, getProductCategories } from './product-categories';
import {
	BACKUP_STORAGE_FAMILY_SLUG,
	EXCLUDED_PRODUCT_SLUGS,
	FEATURED_PRODUCT_SLUGS,
} from './product-slugs';
import type { ProductCategory } from './product-categories';
import type { AgencyProduct } from '@automattic/api-core';

// Some Jetpack products come in size tiers (10GB / 1TB) that the classic list
// folds into one card with a variant picker.
const MERGEABLE_SLUG_PREFIXES = [ 'jetpack-security', 'jetpack-backup' ];

// One card: a single product, or a set of size variants of the same product.
export type ProductListItem = AgencyProduct | AgencyProduct[];

export interface ProductSection {
	key: ProductCategory | 'other';
	items: ProductListItem[];
}

const isHostingPlan = ( product: AgencyProduct ) =>
	product.family_slug === WPCOM_HOSTING_FAMILY_SLUG ||
	product.family_slug === PRESSABLE_HOSTING_FAMILY_SLUG;

// The marketplace catalog: hosting plans live on the Hosting page.
export function getMarketplaceProducts( products: AgencyProduct[] ): AgencyProduct[] {
	return products.filter(
		( product ) => ! EXCLUDED_PRODUCT_SLUGS.includes( product.slug ) && ! isHostingPlan( product )
	);
}

export const getItemProducts = ( item: ProductListItem ) =>
	Array.isArray( item ) ? item : [ item ];

export const getItemId = ( item: ProductListItem ) => getItemProducts( item )[ 0 ].slug;

// The backup storage add-ons share the `jetpack-backup` prefix but are separate
// products, each its own card.
const isMergeable = ( product: AgencyProduct, prefix: string ) =>
	product.slug.startsWith( prefix ) && product.family_slug !== BACKUP_STORAGE_FAMILY_SLUG;

function mergeVariants( products: AgencyProduct[] ): ProductListItem[] {
	const merged = MERGEABLE_SLUG_PREFIXES.map( ( prefix ) =>
		products.filter( ( product ) => isMergeable( product, prefix ) )
	)
		.filter( ( variants ) => variants.length > 0 )
		.map( ( variants ) => ( variants.length === 1 ? variants[ 0 ] : variants ) );
	const rest = products.filter(
		( product ) => ! MERGEABLE_SLUG_PREFIXES.some( ( prefix ) => isMergeable( product, prefix ) )
	);
	return [ ...merged, ...rest ];
}

// Sizes in names sort as numbers (5 sites before 10 sites). The backup storage
// add-ons keep their catalog order instead, since 1TB has to follow 100GB.
const byName = ( locale?: string ) => ( a: ProductListItem, b: ProductListItem ) => {
	const first = getItemProducts( a )[ 0 ];
	const second = getItemProducts( b )[ 0 ];
	if (
		first.family_slug === BACKUP_STORAGE_FAMILY_SLUG &&
		second.family_slug === BACKUP_STORAGE_FAMILY_SLUG
	) {
		return first.product_id - second.product_id;
	}
	return first.name.localeCompare( second.name, locale, { numeric: true } );
};

export const getFeaturedProducts = ( products: AgencyProduct[] ) =>
	FEATURED_PRODUCT_SLUGS.map( ( slug ) =>
		products.find( ( product ) => product.slug === slug )
	).filter( ( product ): product is AgencyProduct => !! product );

// `locale` is the user's Intl language tag, so names sort by their language
// rather than the browser's.
export const getProductListItems = ( products: AgencyProduct[], locale?: string ) =>
	mergeVariants( products ).sort( byName( locale ) );

// A product in two jobs shows in both.
export function getProductSections( products: AgencyProduct[], locale?: string ): ProductSection[] {
	const categories = Object.keys( getCategoryLabels() ) as ProductCategory[];
	const sections: ProductSection[] = [
		...categories.map( ( category ) => ( {
			key: category,
			items: getProductListItems(
				products.filter( ( product ) => getProductCategories( product ).includes( category ) ),
				locale
			),
		} ) ),
		{
			key: 'other' as const,
			items: getProductListItems(
				products.filter( ( product ) => getProductCategories( product ).length === 0 ),
				locale
			),
		},
	];

	return sections.filter( ( section ) => section.items.length > 0 );
}
