/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' ),
	difference = require( 'lodash/array/difference' ),
	isEmpty = require( 'lodash/lang/isEmpty' ),
	pick = require( 'lodash/object/pick' );

/**
 * Internal dependencies
 */
var schema = require( './schema.json' );

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
		is_domain_registration: product.is_domain_registration !== undefined
			? product.is_domain_registration
			: product.isDomainRegistration
	} );
}

function isJpphpBundle( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'host-bundle';
}

function isFreePlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'free_plan';
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

function isPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return (
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
		isDomainRegistration( product ) ||
		product.product_slug === 'domain_map' ||
		product.product_slug === 'private_whois'
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

	if ( typeof product.is_domain_registration === 'undefined' ) {
		throw new Error( 'The `is_domain_registration` product attribute is ' +
		'required to use this function.' );
	}

	return product.is_domain_registration;
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
	} else if ( product.product_slug === 'domain_map' ) {
		return 1;
	} else if ( product.product_slug === 'private_whois' ) {
		return 2;
	}
}

function isDependentProduct( product, dependentProduct ) {
	var slug, dependentSlug;

	product = formatProduct( product );
	assertValidProduct( product );

	slug = isDomainRegistration( product ) ? 'domain' : product.product_slug;
	dependentSlug = isDomainRegistration( dependentProduct ) ? 'domain' : dependentProduct.product_slug;

	return (
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
	isFreePlan: isFreePlan,
	isPremium: isPremium,
	isBusiness: isBusiness,
	isEnterprise: isEnterprise,
	isPlan: isPlan,
	isPrivateRegistration,
	isDomainProduct: isDomainProduct,
	isDomainRedemption,
	isDomainRegistration: isDomainRegistration,
	isDomainMapping: isDomainMapping,
	isSiteRedirect,
	isCredits: isCredits,
	getDomainProductRanking: getDomainProductRanking,
	isDependentProduct: isDependentProduct,
	isGoogleApps: isGoogleApps,
	isTheme,
	isCustomDesign,
	isNoAds,
	isVideoPress,
	isUnlimitedSpace,
	isUnlimitedThemes,
	isSpaceUpgrade,
	whitelistAttributes: whitelistAttributes
};
