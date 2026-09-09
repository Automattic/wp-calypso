import {
	getJetpackProductBenefits,
	getJetpackProductRecommendedFor,
	getPlan,
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

// Plans (Complete, Security, Growth, Starter) live in the plan catalog instead,
// keyed by store slugs such as `jetpack_complete` or `jetpack_security_t1_yearly`.
export function getStorePlan( slug: string ) {
	const storeSlug = slug.replaceAll( '-', '_' );
	return (
		getPlan( storeSlug ) ??
		getPlan( `${ storeSlug }_yearly` ) ??
		getPlan( `${ storeSlug }_monthly` )
	);
}

// Some benefits carry links, so they come back as elements rather than strings.
export function getProductBenefits( product: AgencyProduct ): ReactNode[] {
	const benefits =
		getJetpackProductBenefits( toStoreProduct( product.slug, 'monthly' ) ) ??
		getJetpackProductBenefits( toStoreProduct( product.slug, 'yearly' ) ) ??
		getStorePlan( product.slug )?.getBenefits?.();
	return benefits ?? [];
}

export function getProductRecommendedFor( product: AgencyProduct ): string[] {
	const tags =
		getJetpackProductRecommendedFor( toStoreProduct( product.slug, 'monthly' ) ) ??
		getJetpackProductRecommendedFor( toStoreProduct( product.slug, 'yearly' ) ) ??
		getStorePlan( product.slug )?.getRecommendedFor?.();
	return ( tags ?? [] ).map( ( { label } ) => String( label ) );
}
