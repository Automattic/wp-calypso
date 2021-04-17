import {
	GROUP_JETPACK,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_CHARGEBACK,
	PLAN_FREE,
	PLAN_HOST_BUNDLE,
	PLAN_JETPACK_FREE,
	PLAN_MONTHLY_PERIOD,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_WPCOM_ENTERPRISE,
	WPCOM_TRAFFIC_GUIDE,
	isBloggerPlan,
	isBusinessPlan,
	isCompletePlan,
	isEcommercePlan,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
	isGoogleWorkspaceProductSlug,
	isP2PlusPlan,
	isPersonalPlan,
	isPremiumPlan,
	isSecurityDailyPlan,
	isSecurityRealTimePlan,
	planMatches,
} from './index';
import { domainProductSlugs, TITAN_MAIL_MONTHLY_SLUG } from './constants';
import { formatProduct } from './format-product';
import { getDomain } from './get-domain';

export function isBiennially( rawProduct ) {
	const product = formatProduct( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_BIENNIAL_PERIOD;
}
/**
 * Internal dependencies
 */

export function isBlogger( product ) {
	product = formatProduct( product );

	return isBloggerPlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isBundled( product ) {
	product = formatProduct( product );

	return !! product.is_bundled;
}
/**
 * Internal dependencies
 */

export function isBusiness( product ) {
	product = formatProduct( product );

	return isBusinessPlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isChargeback( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_CHARGEBACK;
}
/**
 * Internal dependencies
 */

export function isComplete( product ) {
	product = formatProduct( product );

	return isCompletePlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isConciergeSession( product ) {
	product = formatProduct( product );

	return 'concierge-session' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isCredits( product ) {
	product = formatProduct( product );

	return 'wordpress-com-credits' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isCustomDesign( product ) {
	product = formatProduct( product );

	return 'custom-design' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isDelayedDomainTransfer( product ) {
	return isDomainTransfer( product ) && product.delayedProvisioning;
}
/**
 * Internal dependencies
 */

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
/**
 * Internal dependencies
 */

export function isDomainMapping( product ) {
	product = formatProduct( product );

	return product.product_slug === 'domain_map';
}
/**
 * Internal dependencies
 */

export function isDomainProduct( product ) {
	product = formatProduct( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}
/**
 * Internal dependencies
 */

export function isDomainRedemption( product ) {
	product = formatProduct( product );

	return product.product_slug === 'domain_redemption';
}
/**
 * Internal dependencies
 */

export function isDomainRegistration( product ) {
	product = formatProduct( product );

	return !! product.is_domain_registration;
}
/**
 * Internal dependencies
 */

export function isDomainTransferProduct( product ) {
	product = formatProduct( product );

	return isDomainTransfer( product );
}
/**
 * Internal dependencies
 */

export function isDomainTransfer( product ) {
	product = formatProduct( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}
/**
 * Internal dependencies
 */

export function isDotComPlan( product ) {
	return isPlan( product ) && ! isJetpackPlan( product );
}
/**
 * Internal dependencies
 */

export function isEcommerce( product ) {
	product = formatProduct( product );

	return isEcommercePlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isEnterprise( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}
/**
 * Internal dependencies
 */

export function isFreeJetpackPlan( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_JETPACK_FREE;
}
/**
 * Internal dependencies
 */

export function isFreePlanProduct( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_FREE;
}
/**
 * Internal dependencies
 */

export function isFreeWordPressComDomain( product ) {
	product = formatProduct( product );
	return product.is_free === true;
}
/**
 * Internal dependencies
 */

export function isGoogleWorkspace( product ) {
	product = formatProduct( product );

	return isGoogleWorkspaceProductSlug( product.product_slug );
}

/**
 * Determines whether the provided Google Workspace product is for a user purchasing extra licenses (versus a new account).
 *
 * @param {object} product - product object
 * @returns {boolean} - true if this product is for extra licenses, false otherwise
 * @see isGoogleWorkspaceExtraLicence() in client/lib/purchases for a function that works on a purchase object
 */
export function isGoogleWorkspaceExtraLicence( product ) {
	product = formatProduct( product );

	if ( ! isGoogleWorkspaceProductSlug( product.product_slug ) ) {
		return false;
	}

	// Checks if the 'new_quantity' property exists as it should only be specified for extra licenses
	return product?.extra?.new_quantity !== undefined;
}

export function isGSuite( product ) {
	product = formatProduct( product );

	return isGSuiteProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicense( product ) {
	product = formatProduct( product );

	return isGSuiteOrExtraLicenseProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicenseOrGoogleWorkspace( product ) {
	product = formatProduct( product );

	return (
		isGSuiteOrExtraLicenseProductSlug( product.product_slug ) ||
		isGoogleWorkspaceProductSlug( product.product_slug )
	);
}

export function isGSuiteOrGoogleWorkspace( product ) {
	product = formatProduct( product );

	return isGSuiteOrGoogleWorkspaceProductSlug( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isGuidedTransfer( product ) {
	product = formatProduct( product );

	return 'guided_transfer' === product.product_slug;
}
/**
 * External dependencies
 */

export function isJetpackAntiSpamSlug( productSlug ) {
	return JETPACK_ANTI_SPAM_PRODUCTS.includes( productSlug );
}
/**
 * Internal dependencies
 */

export function isJetpackAntiSpam( product ) {
	product = formatProduct( product );

	return isJetpackAntiSpamSlug( product.product_slug );
}
/**
 * External dependencies
 */

export function isJetpackBackupSlug( productSlug ) {
	return JETPACK_BACKUP_PRODUCTS.includes( productSlug );
}
/**
 * Internal dependencies
 */

export function isJetpackBackup( product ) {
	product = formatProduct( product );

	return isJetpackBackupSlug( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isJetpackBusiness( product ) {
	product = formatProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}
/**
 * External dependencies
 */

export function isJetpackCloudProductSlug( productSlug ) {
	return (
		JETPACK_SCAN_PRODUCTS.includes( productSlug ) || JETPACK_BACKUP_PRODUCTS.includes( productSlug )
	);
}
/**
 * Internal dependencies
 */

export function isJetpackMonthlyPlan( product ) {
	return isMonthlyProduct( product ) && isJetpackPlan( product );
}
/**
 * Internal dependencies
 */

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}
/**
 * Internal dependencies
 */

export function isJetpackPlan( product ) {
	product = formatProduct( product );

	return isJetpackPlanSlug( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isJetpackPremium( product ) {
	product = formatProduct( product );

	return isPremium( product ) && isJetpackPlan( product );
}
/**
 * External dependencies
 */

export function isJetpackProductSlug( productSlug ) {
	return JETPACK_PRODUCTS_LIST.includes( productSlug );
}
/**
 * Internal dependencies
 */

export function isJetpackProduct( product ) {
	product = formatProduct( product );

	return isJetpackProductSlug( product.product_slug );
}
/**
 * External dependencies
 */

export function isJetpackScanSlug( productSlug ) {
	return JETPACK_SCAN_PRODUCTS.includes( productSlug );
}
/**
 * Internal dependencies
 */

export function isJetpackScan( product ) {
	product = formatProduct( product );

	return isJetpackScanSlug( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isJetpackSearch( product ) {
	product = formatProduct( product );

	return JETPACK_SEARCH_PRODUCTS.includes( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isJpphpBundle( product ) {
	product = formatProduct( product );

	return product.product_slug === PLAN_HOST_BUNDLE;
}
/**
 * Internal dependencies
 */

export function isMonthlyProduct( rawProduct ) {
	const product = formatProduct( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}
/**
 * Internal dependencies
 */

export function isNoAds( product ) {
	product = formatProduct( product );

	return 'no-adverts/no-adverts.php' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isP2Plus( product ) {
	product = formatProduct( product );

	return isP2PlusPlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isPersonal( product ) {
	product = formatProduct( product );

	return isPersonalPlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isPlan( product ) {
	product = formatProduct( product );

	return (
		isBlogger( product ) ||
		isPersonal( product ) ||
		isPremium( product ) ||
		isBusiness( product ) ||
		isEcommerce( product ) ||
		isEnterprise( product ) ||
		isJetpackPlan( product ) ||
		isJpphpBundle( product ) ||
		isP2Plus( product )
	);
}
/**
 * Internal dependencies
 */

export function isPremium( product ) {
	product = formatProduct( product );

	return isPremiumPlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isSecurityDaily( product ) {
	product = formatProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isSecurityRealTime( product ) {
	product = formatProduct( product );

	return isSecurityRealTimePlan( product.product_slug );
}
/**
 * Internal dependencies
 */

export function isSiteRedirect( product ) {
	product = formatProduct( product );

	return product.product_slug === 'offsite_redirect';
}
/**
 * Internal dependencies
 */

export function isSpaceUpgrade( product ) {
	product = formatProduct( product );

	return (
		'1gb_space_upgrade' === product.product_slug ||
		'5gb_space_upgrade' === product.product_slug ||
		'10gb_space_upgrade' === product.product_slug ||
		'50gb_space_upgrade' === product.product_slug ||
		'100gb_space_upgrade' === product.product_slug
	);
}
/**
 * Internal dependencies
 */

export function isTheme( product ) {
	product = formatProduct( product );

	return 'premium_theme' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isTitanMail( product ) {
	product = formatProduct( product );

	return product.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
/**
 * Internal dependencies
 */

export function isTrafficGuide( product ) {
	product = formatProduct( product );

	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isUnlimitedSpace( product ) {
	product = formatProduct( product );

	return 'unlimited_space' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isUnlimitedThemes( product ) {
	product = formatProduct( product );

	return 'unlimited_themes' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isVideoPress( product ) {
	product = formatProduct( product );

	return 'videopress' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isVipPlan( product ) {
	product = formatProduct( product );

	return 'vip' === product.product_slug;
}
/**
 * Internal dependencies
 */

export function isYearly( rawProduct ) {
	const product = formatProduct( rawProduct );

	return parseInt( product.bill_period, 10 ) === PLAN_ANNUAL_PERIOD;
}
