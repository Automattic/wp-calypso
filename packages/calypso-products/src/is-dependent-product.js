/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { getDomain } from './get-domain';
import { isDomainMapping } from './is-domain-mapping';
import { isDomainRegistration } from './is-domain-registration';
import { isPlan } from './is-plan';
import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
} from './index';

const productDependencies = {
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

export function isDependentProduct( product, dependentProduct, domainsWithPlansOnly ) {
	let isPlansOnlyDependent = false;

	product = formatProduct( product );
	assertValidProduct( product );

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
