import {
	getJetpackProductBenefits,
	getJetpackProductRecommendedFor,
} from '@automattic/calypso-products';
import type { AgencyProduct } from '@automattic/api-core';
import type { Product } from '@automattic/calypso-products';
import type { ReactNode } from 'react';

// The Jetpack catalog in calypso-products is keyed by store slugs
// (`jetpack_backup_t1_monthly`); the agency API uses `jetpack-backup-t1`.
function toStoreProduct( slug: string, term: 'monthly' | 'yearly' ): Product {
	const baseSlug = slug.replaceAll( '-', '_' ).replace( /_(monthly|yearly)$/, '' );
	return { product_slug: `${ baseSlug }_${ term }` } as unknown as Product;
}

// Some benefits carry links, so they come back as elements rather than strings.
export function getProductBenefits( product: AgencyProduct ): ReactNode[] {
	const benefits =
		getJetpackProductBenefits( toStoreProduct( product.slug, 'monthly' ) ) ??
		getJetpackProductBenefits( toStoreProduct( product.slug, 'yearly' ) );
	return benefits ?? [];
}

export function getProductRecommendedFor( product: AgencyProduct ): string[] {
	const tags =
		getJetpackProductRecommendedFor( toStoreProduct( product.slug, 'monthly' ) ) ??
		getJetpackProductRecommendedFor( toStoreProduct( product.slug, 'yearly' ) );
	return ( tags ?? [] ).map( ( { label } ) => String( label ) );
}
