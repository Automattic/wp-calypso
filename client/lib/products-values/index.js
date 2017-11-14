/** @format */

/**
 * External dependencies
 */

import { assign, difference, isEmpty, pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_PLANS,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_HOST_BUNDLE,
	PLAN_WPCOM_ENTERPRISE,
	PLAN_CHARGEBACK,
	PLAN_MONTHLY_PERIOD,
} from 'lib/plans/constants';
import { isTransfer } from 'lib/cart-values/cart-items';

import schema from './schema.json';

const productDependencies = {
	domain: {
		domain_redemption: true,
		gapps: true,
		gapps_extra_license: true,
		gapps_unlimited: true,
		private_whois: true,
	},
	domain_redemption: {
		domain: true,
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
	const personalProducts = [ PLAN_PERSONAL, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ];

	product = formatProduct( product );
	assertValidProduct( product );

	return personalProducts.indexOf( product.product_slug ) >= 0;
}

export function isPremium( product ) {
	const premiumProducts = [ PLAN_PREMIUM, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ];

	product = formatProduct( product );
	assertValidProduct( product );

	return premiumProducts.indexOf( product.product_slug ) >= 0;
}

export function isBusiness( product ) {
	const businessProducts = [ PLAN_BUSINESS, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ];

	product = formatProduct( product );
	assertValidProduct( product );

	return businessProducts.indexOf( product.product_slug ) >= 0;
}

export function isEnterprise( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}

export function isJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return JETPACK_PLANS.indexOf( product.product_slug ) >= 0;
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

export function isMonthly( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
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
		isPersonal( product ) ||
		isPremium( product ) ||
		isBusiness( product ) ||
		isEnterprise( product ) ||
		isJpphpBundle( product )
	);
}

export function isDotComPlan( product ) {
	return isPlan( product ) && ! isJetpackPlan( product );
}

export function isPrivacyProtection( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'private_whois';
}

export function isDomainProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return (
		isDomainMapping( product ) || isDomainRegistration( product ) || isPrivacyProtection( product )
	);
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

export function isSiteRedirect( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'offsite_redirect';
}

export function isDomainTransfer( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isTransfer( product );
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
	} else if ( isPrivacyProtection( product ) ) {
		return 2;
	}
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
			product.meta === dependentProduct.meta )
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

	return (
		'gapps' === product.product_slug ||
		'gapps_unlimited' === product.product_slug ||
		'gapps_extra_license' === product.product_slug
	);
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
