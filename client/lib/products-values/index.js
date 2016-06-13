/** @ssr-ready **/

/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	difference = require( 'lodash/difference' ),
	isEmpty = require( 'lodash/isEmpty' ),
	pick = require( 'lodash/pick' );

/**
 * Internal dependencies
 */
var schema = require( './schema.json' ),
	PLAN_PERSONAL = require( 'lib/plans/constants' ).PLAN_PERSONAL;

var productDependencies = {
	domain: {
		domain_redemption: true,
		gapps: true,
		gapps_extra_license: true,
		gapps_unlimited: true,
		private_whois: true
	},
	domain_redemption: {
		domain: true
	}
};

function assertValidProduct( product ) {
	var missingAttributes = difference( schema.required, Object.keys( product ) );

	if ( ! isEmpty( missingAttributes ) ) {
		throw new Error( 'Missing required attributes for ProductValue: [' +
		missingAttributes.join( ', ' ) + ']' );
	}
}

function formatProduct( product ) {
	return assign( {}, product, {
		product_slug: product.product_slug || product.productSlug,
		product_type: product.product_type || product.productType,
		is_domain_registration: product.is_domain_registration !== undefined
			? product.is_domain_registration
			: product.isDomainRegistration,
		free_trial: product.free_trial || product.freeTrial
	} );
}

function isChargeback( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'chargeback';
}

function isFreePlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'free_plan';
}

function isFreeJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'jetpack_free';
}

function isFreeTrial( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return Boolean( product.free_trial );
}

function isPersonal( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_PERSONAL;
}

function isPremium( product ) {
	var premiumProducts = [ 'value_bundle', 'jetpack_premium' ];

	product = formatProduct( product );
	assertValidProduct( product );

	return ( premiumProducts.indexOf( product.product_slug ) >= 0 );
}

function isBusiness( product ) {
	var businessProducts = [ 'business-bundle', 'jetpack_business' ];

	product = formatProduct( product );
	assertValidProduct( product );

	return ( businessProducts.indexOf( product.product_slug ) >= 0 );
}

function isEnterprise( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'wpcom-enterprise';
}

function isJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'jetpack' === product.product_type;
}

function isJetpackBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}

function isJetpackPremium( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPremium( product ) && isJetpackPlan( product );
}

function isJpphpBundle( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'host-bundle';
}

function isPlan( product ) {
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

function isPrivateRegistration( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'private_whois';
}

function isDomainProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return (
		isDomainMapping( product ) ||
		isDomainRegistration( product ) ||
		isPrivateRegistration( product )
	);
}

function isDomainRedemption( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'domain_redemption';
}

function isDomainRegistration( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return !! product.is_domain_registration;
}

function isDomainMapping( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'domain_map';
}

function isSiteRedirect( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'offsite_redirect';
}

function isCredits( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'wordpress-com-credits' === product.product_slug;
}

function getDomainProductRanking( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	if ( isDomainRegistration( product ) ) {
		return 0;
	} else if ( isDomainMapping( product ) ) {
		return 1;
	} else if ( isPrivateRegistration( product ) ) {
		return 2;
	}
}

function isDependentProduct( product, dependentProduct ) {
	var slug, dependentSlug, isPlansOnlyDependent = false, withPlansOnly = false, withPersonalPlan = false;

	product = formatProduct( product );
	assertValidProduct( product );

	slug = isDomainRegistration( product ) ? 'domain' : product.product_slug;
	dependentSlug = isDomainRegistration( dependentProduct ) ? 'domain' : dependentProduct.product_slug;

	withPlansOnly = product.extra.withPlansOnly === 'yes' || dependentProduct.extra.withPlansOnly === 'yes';
	withPersonalPlan = product.extra.withPersonalPlan === 'yes' || dependentProduct.extra.withPersonalPlan === 'yes';

	if ( ( product.extra && dependentProduct.extra ) &&	( withPlansOnly || withPersonalPlan ) ) {
		isPlansOnlyDependent = isPlan( product ) && ( isDomainRegistration( dependentProduct ) || isDomainMapping( dependentProduct ) );
	}

	return isPlansOnlyDependent || (
		productDependencies[ slug ] &&
		productDependencies[ slug ][ dependentSlug ] &&
		product.meta === dependentProduct.meta
	);
}

function isGoogleApps( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'gapps' === product.product_slug || 'gapps_unlimited' === product.product_slug || 'gapps_extra_license' === product.product_slug;
}

function isTheme( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'premium_theme' === product.product_slug;
}

function isCustomDesign( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'custom-design' === product.product_slug;
}

function isNoAds( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'no-adverts/no-adverts.php' === product.product_slug;
}

function isVideoPress( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'videopress' === product.product_slug;
}

function isUnlimitedSpace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_space' === product.product_slug;
}

function isUnlimitedThemes( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_themes' === product.product_slug;
}

function whitelistAttributes( product ) {
	return pick( product, Object.keys( schema.properties ) );
}

function isSpaceUpgrade( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return '1gb_space_upgrade' === product.product_slug ||
		'5gb_space_upgrade' === product.product_slug ||
		'10gb_space_upgrade' === product.product_slug ||
		'50gb_space_upgrade' === product.product_slug ||
		'100gb_space_upgrade' === product.product_slug;
}

module.exports = {
	formatProduct,
	getDomainProductRanking,
	isBusiness,
	isChargeback,
	isCredits,
	isCustomDesign,
	isDependentProduct,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isEnterprise,
	isFreeJetpackPlan,
	isFreePlan,
	isPersonal,
	isFreeTrial,
	isGoogleApps,
	isJetpackBusiness,
	isJetpackPlan,
	isJetpackPremium,
	isJpphpBundle,
	isNoAds,
	isPlan,
	isPremium,
	isPrivateRegistration,
	isSiteRedirect,
	isSpaceUpgrade,
	isTheme,
	isUnlimitedSpace,
	isUnlimitedThemes,
	isVideoPress,
	whitelistAttributes
};
