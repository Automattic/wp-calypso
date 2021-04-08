/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { getDomain } from 'calypso/lib/products-values/get-domain';
import { isDomainMapping } from 'calypso/lib/products-values/is-domain-mapping';
import { isDomainRegistration } from 'calypso/lib/products-values/is-domain-registration';
import { isPlan } from 'calypso/lib/products-values/is-plan';
import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
} from 'calypso/lib/plans/constants';
import type { FormattedProduct, CamelCaseProduct } from './types';

type ProductDependencies = Record< string, boolean >;

const productDependencies: Record< string, ProductDependencies > = {
	domain: {
		domain_redemption: true,
		gapps: true,
		gapps_extra_license: true,
		gapps_unlimited: true,
	},
	[ PLAN_BUSINESS_MONTHLY ]: {
		domain_redemption: true,
	},
	[ PLAN_BUSINESS ]: {
		domain_redemption: true,
	},
	[ PLAN_BUSINESS_2_YEARS ]: {
		domain_redemption: true,
	},
	[ PLAN_PERSONAL ]: {
		domain_redemption: true,
	},
	[ PLAN_PERSONAL_2_YEARS ]: {
		domain_redemption: true,
	},
	[ PLAN_PREMIUM ]: {
		domain_redemption: true,
	},
	[ PLAN_PREMIUM_2_YEARS ]: {
		domain_redemption: true,
	},
};

export function isDependentProduct(
	product: FormattedProduct | CamelCaseProduct,
	dependentProduct: FormattedProduct,
	domainsWithPlansOnly: boolean
): boolean {
	let isPlansOnlyDependent = false;

	product = formatProduct( product );

	const slug = isDomainRegistration( product ) ? 'domain' : product.product_slug;
	const dependentSlug = isDomainRegistration( dependentProduct )
		? 'domain'
		: dependentProduct.product_slug;

	if ( domainsWithPlansOnly ) {
		isPlansOnlyDependent =
			isPlan( product ) &&
			( isDomainRegistration( dependentProduct ) || isDomainMapping( dependentProduct ) );
	}

	return (
		isPlansOnlyDependent ||
		( productDependencies[ slug ] &&
			productDependencies[ slug ][ dependentSlug ] &&
			getDomain( product ) === getDomain( dependentProduct ) )
	);
}
