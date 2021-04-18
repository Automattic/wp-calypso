/**
 * Internal dependencies
 */
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
import type { DelayedDomainTransferProduct, FormattedProduct, UnknownProduct } from './types';

export function isBiennially( rawProduct: UnknownProduct ): boolean {
	const product = formatProduct( rawProduct );

	return parseInt( String( product.bill_period ), 10 ) === PLAN_BIENNIAL_PERIOD;
}

export function isBlogger( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isBloggerPlan( product.product_slug );
}

export function isBundled( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return !! product.is_bundled;
}

export function isBusiness( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isBusinessPlan( product.product_slug );
}

export function isChargeback( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === PLAN_CHARGEBACK;
}

export function isComplete( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isCompletePlan( product.product_slug );
}

export function isConciergeSession( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'concierge-session' === product.product_slug;
}

export function isCredits( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'wordpress-com-credits' === product.product_slug;
}

export function isCustomDesign( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'custom-design' === product.product_slug;
}

export function isDelayedDomainTransfer( product: DelayedDomainTransferProduct ): boolean {
	return isDomainTransfer( product ) && Boolean( product.delayedProvisioning );
}

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
	product: UnknownProduct,
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

export function isDomainMapping( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === 'domain_map';
}

export function isDomainProduct( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}

export function isDomainRedemption( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === 'domain_redemption';
}

export function isDomainRegistration( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return !! product.is_domain_registration;
}

export function isDomainTransferProduct( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isDomainTransfer( product );
}

export function isDomainTransfer( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}

export function isDotComPlan( product: UnknownProduct ): boolean {
	return isPlan( product ) && ! isJetpackPlan( product );
}

export function isEcommerce( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isEcommercePlan( product.product_slug );
}

export function isEnterprise( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === PLAN_WPCOM_ENTERPRISE;
}

export function isFreeJetpackPlan( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === PLAN_JETPACK_FREE;
}

export function isFreePlanProduct( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === PLAN_FREE;
}

export function isFreeWordPressComDomain( product: UnknownProduct ): boolean {
	product = formatProduct( product );
	return product.is_free === true;
}

export function isGoogleWorkspace( product: UnknownProduct ): boolean {
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
export function isGoogleWorkspaceExtraLicence( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	if ( ! isGoogleWorkspaceProductSlug( product.product_slug ) ) {
		return false;
	}

	// Checks if the 'new_quantity' property exists as it should only be specified for extra licenses
	return product?.extra?.new_quantity !== undefined;
}

export function isGSuite( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isGSuiteProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicense( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isGSuiteOrExtraLicenseProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicenseOrGoogleWorkspace( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return (
		isGSuiteOrExtraLicenseProductSlug( product.product_slug ) ||
		isGoogleWorkspaceProductSlug( product.product_slug )
	);
}

export function isGSuiteOrGoogleWorkspace( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isGSuiteOrGoogleWorkspaceProductSlug( product.product_slug );
}

export function isGuidedTransfer( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'guided_transfer' === product.product_slug;
}

export function isJetpackAntiSpamSlug( productSlug: string ): boolean {
	return JETPACK_ANTI_SPAM_PRODUCTS.includes( productSlug );
}

export function isJetpackAntiSpam( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isJetpackAntiSpamSlug( product.product_slug );
}

export function isJetpackBackupSlug( productSlug: string ): boolean {
	return JETPACK_BACKUP_PRODUCTS.includes( productSlug );
}

export function isJetpackBackup( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isJetpackBackupSlug( product.product_slug );
}

export function isJetpackBusiness( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}

export function isJetpackCloudProductSlug( productSlug: string ): boolean {
	return (
		JETPACK_SCAN_PRODUCTS.includes( productSlug ) || JETPACK_BACKUP_PRODUCTS.includes( productSlug )
	);
}

export function isJetpackMonthlyPlan( product: UnknownProduct ): boolean {
	return isMonthlyProduct( product ) && isJetpackPlan( product );
}

export function isJetpackPlanSlug( productSlug: string ): boolean {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}

export function isJetpackPlan( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isJetpackPlanSlug( product.product_slug );
}

export function isJetpackPremium( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isPremium( product ) && isJetpackPlan( product );
}

export function isJetpackProductSlug( productSlug: string ): boolean {
	return JETPACK_PRODUCTS_LIST.includes( productSlug );
}

export function isJetpackProduct( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isJetpackProductSlug( product.product_slug );
}

export function isJetpackScanSlug( productSlug: string ): boolean {
	return JETPACK_SCAN_PRODUCTS.includes( productSlug );
}

export function isJetpackScan( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isJetpackScanSlug( product.product_slug );
}

export function isJetpackSearch( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return JETPACK_SEARCH_PRODUCTS.includes( product.product_slug );
}

export function isJpphpBundle( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === PLAN_HOST_BUNDLE;
}

export function isMonthlyProduct( rawProduct: UnknownProduct ): boolean {
	const product = formatProduct( rawProduct );

	return parseInt( String( product.bill_period ), 10 ) === PLAN_MONTHLY_PERIOD;
}

export function isNoAds( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'no-adverts/no-adverts.php' === product.product_slug;
}

export function isP2Plus( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isP2PlusPlan( product.product_slug );
}

export function isPersonal( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isPersonalPlan( product.product_slug );
}

export function isPlan( product: UnknownProduct ): boolean {
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

export function isPremium( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isPremiumPlan( product.product_slug );
}

export function isSecurityDaily( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}

export function isSecurityRealTime( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return isSecurityRealTimePlan( product.product_slug );
}

export function isSiteRedirect( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === 'offsite_redirect';
}

export function isSpaceUpgrade( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return (
		'1gb_space_upgrade' === product.product_slug ||
		'5gb_space_upgrade' === product.product_slug ||
		'10gb_space_upgrade' === product.product_slug ||
		'50gb_space_upgrade' === product.product_slug ||
		'100gb_space_upgrade' === product.product_slug
	);
}

export function isTheme( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'premium_theme' === product.product_slug;
}

export function isTitanMail( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return product.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}

export function isTrafficGuide( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}

export function isUnlimitedSpace( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'unlimited_space' === product.product_slug;
}

export function isUnlimitedThemes( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'unlimited_themes' === product.product_slug;
}

export function isVideoPress( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'videopress' === product.product_slug;
}

export function isVipPlan( product: UnknownProduct ): boolean {
	product = formatProduct( product );

	return 'vip' === product.product_slug;
}

export function isYearly( rawProduct: UnknownProduct ): boolean {
	const product = formatProduct( rawProduct );

	return parseInt( String( product.bill_period ), 10 ) === PLAN_ANNUAL_PERIOD;
}
