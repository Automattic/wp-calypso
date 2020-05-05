/**
 * External dependencies
 */
import { assign, difference, get, includes, isEmpty, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { isGSuiteOrExtraLicenseProductSlug } from 'lib/gsuite';
import {
	getJetpackProductsDisplayNames,
	getJetpackProductsTaglines,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
} from './constants';
import { PRODUCTS_LIST } from './products-list';
import {
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_HOST_BUNDLE,
	PLAN_WPCOM_ENTERPRISE,
	PLAN_CHARGEBACK,
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	GROUP_JETPACK,
} from 'lib/plans/constants';

import {
	planMatches,
	isEcommercePlan,
	isBusinessPlan,
	isPremiumPlan,
	isPersonalPlan,
	isBloggerPlan,
} from 'lib/plans';
import { domainProductSlugs } from 'lib/domains/constants';
import schema from './schema.json';

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

function assertValidProduct( product ) {
	const missingAttributes = difference( schema.required, Object.keys( product ) );

	if ( ! isEmpty( missingAttributes ) ) {
		throw new Error(
			'Missing required attributes for ProductValue: [' + missingAttributes.join( ', ' ) + ']'
		);
	}
}

export function formatProduct( product ) {
	return assign( {}, product, {
		product_slug: product.product_slug || product.productSlug,
		product_type: product.product_type || product.productType,
		included_domain_purchase_amount:
			product.included_domain_purchase_amount || product.includedDomainPurchaseAmount,
		is_domain_registration:
			product.is_domain_registration !== undefined
				? product.is_domain_registration
				: product.isDomainRegistration,
		free_trial: product.free_trial || product.freeTrial,
	} );
}

export function isChargeback( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_CHARGEBACK;
}

export function includesProduct( products, product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return products.indexOf( product.product_slug ) >= 0;
}

export function isFreePlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_FREE;
}

export function isFreeJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_JETPACK_FREE;
}

export function isFreeTrial( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return Boolean( product.free_trial );
}

export function isPersonal( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPersonalPlan( product.product_slug );
}

export function isBlogger( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBloggerPlan( product.product_slug );
}

export function isPremium( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPremiumPlan( product.product_slug );
}

export function isBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusinessPlan( product.product_slug );
}

export function isEcommerce( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isEcommercePlan( product.product_slug );
}

export function isEnterprise( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}

export function isJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackPlanSlug( product.product_slug );
}

export function isJetpackBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}

export function isJetpackPremium( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPremium( product ) && isJetpackPlan( product );
}

export function isVipPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'vip' === product.product_slug;
}

export function isJetpackMonthlyPlan( product ) {
	return isMonthly( product ) && isJetpackPlan( product );
}

export function isJetpackBackupSlug( productSlug ) {
	return includes( JETPACK_BACKUP_PRODUCTS, productSlug );
}

export function isJetpackBackup( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackBackupSlug( product.product_slug );
}

export function isJetpackProductSlug( productSlug ) {
	return includes( JETPACK_PRODUCTS_LIST, productSlug );
}

export function isJetpackProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackProductSlug( product.product_slug );
}

export function getProductFromSlug( productSlug ) {
	if ( PRODUCTS_LIST[ productSlug ] ) {
		return formatProduct( PRODUCTS_LIST[ productSlug ] );
	}
	return productSlug; // Consistent behavior with `getPlan`.
}

export function isMonthly( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}

export function isYearly( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_ANNUAL_PERIOD;
}

export function isBiennially( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_BIENNIAL_PERIOD;
}

export function isJpphpBundle( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_HOST_BUNDLE;
}

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

export function whitelistAttributes( product ) {
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
