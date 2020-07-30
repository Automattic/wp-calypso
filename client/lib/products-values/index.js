/**
 * External dependencies
 */
import { get, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { isGSuiteOrExtraLicenseProductSlug } from 'lib/gsuite';
import { JETPACK_PRODUCTS_LIST } from './constants';
import { getJetpackProductsDisplayNames, getJetpackProductsTaglines } from './translations';
import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
} from 'lib/plans/constants';

import { domainProductSlugs } from 'lib/domains/constants';
import schema from './schema.json';

import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isPersonal } from './is-personal';
import { isBlogger } from './is-blogger';
import { isPremium } from './is-premium';
import { isBusiness } from './is-business';
import { isEcommerce } from './is-ecommerce';
import { isEnterprise } from './is-enterprise';
import { isJetpackPlan } from './is-jetpack-plan';
import { isJetpackBackupSlug } from './is-jetpack-backup-slug';
import { isJpphpBundle } from './is-jpphp-bundle';

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

export { formatProduct } from './format-product';
export { isChargeback } from './is-chargeback';
export { includesProduct } from './includes-product';
export { isFreePlan } from './is-free-plan';
export { isFreeJetpackPlan } from './is-free-jetpack-plan';
export { isFreeTrial } from './is-free-trial';
export { isPersonal } from './is-personal';
export { isBlogger } from './is-blogger';
export { isPremium } from './is-premium';
export { isBusiness } from './is-business';
export { isEcommerce } from './is-ecommerce';
export { isEnterprise } from './is-enterprise';
export { isJetpackPlanSlug } from './is-jetpack-plan-slug';
export { isJetpackPlan } from './is-jetpack-plan';
export { isJetpackBusiness } from './is-jetpack-business';
export { isJetpackPremium } from './is-jetpack-premium';
export { isVipPlan } from './is-vip-plan';
export { isMonthly } from './is-monthly';
export { isYearly } from './is-yearly';
export { isBiennially } from './is-biennially';
export { isJetpackMonthlyPlan } from './is-jetpack-monthly-plan';
export { isJetpackBackupSlug } from './is-jetpack-backup-slug';
export { isJetpackBackup } from './is-jetpack-backup';
export { isJetpackScanSlug } from './is-jetpack-scan-slug';
export { isJetpackAntiSpamSlug } from './is-jetpack-anti-spam-slug';
export { isJetpackScan } from './is-jetpack-scan';
export { isJetpackAntiSpam } from './is-jetpack-anti-spam';
export { isJetpackCloudProductSlug } from './is-jetpack-cloud-product-slug';
export { isJetpackProductSlug } from './is-jetpack-product-slug';
export { isJetpackProduct } from './is-jetpack-product';
export { getProductFromSlug } from './get-product-from-slug';
export { isJpphpBundle } from './is-jpphp-bundle';

export function isPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return (
		isBlogger( product ) ||
		isPersonal( product ) ||
		isPremium( product ) ||
		isBusiness( product ) ||
		isEcommerce( product ) ||
		isEnterprise( product ) ||
		isJpphpBundle( product )
	);
}

export function isDotComPlan( product ) {
	return isPlan( product ) && ! isJetpackPlan( product );
}

export function isDomainProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}

export function isDomainRedemption( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'domain_redemption';
}

export function isDomainRegistration( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return !! product.is_domain_registration;
}

export function isDomainMapping( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'domain_map';
}

export function getIncludedDomainPurchaseAmount( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.included_domain_purchase_amount;
}

export function isSiteRedirect( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'offsite_redirect';
}

export function isDomainTransferProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainTransfer( product );
}

export function isDomainTransfer( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}

export function isDelayedDomainTransfer( product ) {
	return isDomainTransfer( product ) && product.delayedProvisioning;
}

export function isBundled( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return !! product.is_bundled;
}

export function isCredits( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'wordpress-com-credits' === product.product_slug;
}

export function getDomainProductRanking( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	if ( isDomainRegistration( product ) ) {
		return 0;
	} else if ( isDomainMapping( product ) ) {
		return 1;
	}
}

export function getDomain( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	const domainToBundle = get( product, 'extra.domain_to_bundle', false );
	if ( domainToBundle ) {
		return domainToBundle;
	}

	return product.meta;
}

export function getProductsSlugs() {
	return JETPACK_PRODUCTS_LIST;
}

export function getProductClass( productSlug ) {
	if ( isJetpackBackupSlug( productSlug ) ) {
		return 'is-jetpack-backup';
	}

	return '';
}

/**
 * Get Jetpack product display name based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product display name
 */
export function getJetpackProductDisplayName( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames();

	return jetpackProductsDisplayNames?.[ product.productSlug ];
}

/**
 * Get Jetpack product tagline based on the product purchase object.
 *
 * @param   product {object}             Product purchase object
 * @returns         {string|object} Product tagline
 */
export function getJetpackProductTagline( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	const jetpackProductsTaglines = getJetpackProductsTaglines();

	return jetpackProductsTaglines?.[ product.productSlug ];
}

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
export function isFreeWordPressComDomain( product ) {
	product = formatProduct( product );
	assertValidProduct( product );
	return product.is_free === true;
}

export function isGoogleApps( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isGSuiteOrExtraLicenseProductSlug( product.product_slug );
}

export function isGuidedTransfer( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'guided_transfer' === product.product_slug;
}

export function isTheme( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'premium_theme' === product.product_slug;
}

export function isCustomDesign( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'custom-design' === product.product_slug;
}

export function isNoAds( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'no-adverts/no-adverts.php' === product.product_slug;
}

export function isVideoPress( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'videopress' === product.product_slug;
}

export function isUnlimitedSpace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_space' === product.product_slug;
}

export function isUnlimitedThemes( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_themes' === product.product_slug;
}

export function allowedProductAttributes( product ) {
	return pick( product, Object.keys( schema.properties ) );
}

export function isSpaceUpgrade( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return (
		'1gb_space_upgrade' === product.product_slug ||
		'5gb_space_upgrade' === product.product_slug ||
		'10gb_space_upgrade' === product.product_slug ||
		'50gb_space_upgrade' === product.product_slug ||
		'100gb_space_upgrade' === product.product_slug
	);
}

export function isConciergeSession( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'concierge-session' === product.product_slug;
}
