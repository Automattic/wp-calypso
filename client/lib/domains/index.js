/**
 * External dependencies
 */
import inherits from 'inherits';
import { includes, find, get, replace } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { type as domainTypes, domainAvailability } from './constants';
import { parseDomainAgainstTldList } from './utils';
import wpcomMultiLevelTlds from './tlds/wpcom-multi-level-tlds.json';

function ValidationError( code ) {
	this.code = code;
	this.message = code;
}

inherits( ValidationError, Error );

function checkAuthCode( domainName, authCode, onComplete ) {
	if ( ! domainName || ! authCode ) {
		onComplete( null, { success: false } );
		return;
	}

	wpcom.undocumented().checkAuthCode( domainName, authCode, function( serverError, result ) {
		if ( serverError ) {
			onComplete( { error: serverError.error, message: serverError.message } );
			return;
		}

		onComplete( null, result );
	} );
}

function checkDomainAvailability( params, onComplete ) {
	const { domainName, blogId } = params;
	const isCartPreCheck = get( params, 'isCartPreCheck', false );
	if ( ! domainName ) {
		onComplete( null, { status: domainAvailability.EMPTY_QUERY } );
		return;
	}

	wpcom
		.undocumented()
		.isDomainAvailable( domainName, blogId, isCartPreCheck, function( serverError, result ) {
			if ( serverError ) {
				onComplete( serverError.error );
				return;
			}

			onComplete( null, result );
		} );
}

function checkInboundTransferStatus( domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( null );
		return;
	}

	wpcom.undocumented().getInboundTransferStatus( domainName, function( serverError, result ) {
		if ( serverError ) {
			onComplete( serverError.error );
			return;
		}

		onComplete( null, result );
	} );
}

function startInboundTransfer( siteId, domainName, authCode, onComplete ) {
	if ( ! domainName || ! siteId ) {
		onComplete( null );
		return;
	}

	wpcom
		.undocumented()
		.startInboundTransfer( siteId, domainName, authCode, function( serverError, result ) {
			if ( serverError ) {
				onComplete( serverError.error );
				return;
			}

			onComplete( null, result );
		} );
}

function resendInboundTransferEmail( domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( null );
		return;
	}

	wpcom.undocumented().resendInboundTransferEmail( domainName, function( serverError, result ) {
		if ( serverError ) {
			onComplete( serverError );
			return;
		}

		onComplete( null, result );
	} );
}

function canRedirect( siteId, domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( new ValidationError( 'empty_query' ) );
		return;
	}

	if ( ! domainName.match( /^https?:\/\//i ) ) {
		domainName = 'http://' + domainName;
	}

	if ( includes( domainName, '@' ) ) {
		onComplete( new ValidationError( 'invalid_domain' ) );
		return;
	}

	wpcom.undocumented().canRedirect( siteId, domainName, function( serverError, data ) {
		if ( serverError ) {
			onComplete( new ValidationError( serverError.error ) );
		} else if ( ! data.can_redirect ) {
			onComplete( new ValidationError( 'cannot_redirect' ) );
		} else {
			onComplete( null );
		}
	} );
}

function getPrimaryDomain( siteId, onComplete ) {
	wpcom
		.site( siteId )
		.domain()
		.getPrimary( function( serverError, data ) {
			onComplete( serverError, data );
		} );
}

function getFixedDomainSearch( domainName ) {
	return domainName
		.trim()
		.toLowerCase()
		.replace( /^(https?:\/\/)?(www[0-9]?\.)?/, '' )
		.replace( /^www[0-9]?\./, '' )
		.replace( /\/$/, '' )
		.replace( /_/g, '-' );
}

function isSubdomain( domainName ) {
	return domainName.match( /\..+\.[a-z]{2,3}\.[a-z]{2}$|\..+\.[a-z]{3,}$|\..{4,}\.[a-z]{2}$/ );
}

function isHstsRequired( productSlug, productsList ) {
	const product = find( productsList, [ 'product_slug', productSlug ] ) || {};

	return get( product, 'is_hsts_required', false );
}

function isMappedDomain( domain ) {
	return domain.type === domainTypes.MAPPED;
}

/**
 * Checks if the supplied domain is a mapped domain and has WordPress.com name servers.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is mapped and has WordPress.com name servers, false otherwise
 */
function isMappedDomainWithWpcomNameservers( domain ) {
	return isMappedDomain( domain ) && get( domain, 'hasWpcomNameservers', false );
}

function getSelectedDomain( { domains, selectedDomainName, isTransfer } ) {
	return find( domains, domain => {
		if ( domain.name !== selectedDomainName ) {
			return false;
		}

		if ( isTransfer && domain.type === domainTypes.TRANSFER ) {
			return true;
		}

		return domain.type !== domainTypes.TRANSFER;
	} );
}

function isRegisteredDomain( domain ) {
	return domain.type === domainTypes.REGISTERED;
}

function getRegisteredDomains( domains ) {
	return domains.filter( isRegisteredDomain );
}

function getMappedDomains( domains ) {
	return domains.filter( isMappedDomain );
}

function hasMappedDomain( domains ) {
	return getMappedDomains( domains ).length > 0;
}

/**
 * Parse the tld from a given domain name, semi-naively. The function
 * first parses against a list of tlds that have been sold on WP.com
 * and falls back to a simplistic "everything after the last dot" approach
 * if the whitelist failed. This is ultimately not comprehensive as that
 * is a poor base assumption (lots of second level tlds, etc). However,
 * for our purposes, the approach should be "good enough" for a long time.
 *
 * @param {string}     domainName     The domain name parse the tld from
 * @returns {string}                   The TLD or an empty string
 */
function getTld( domainName ) {
	const lastIndexOfDot = domainName.lastIndexOf( '.' );

	if ( lastIndexOfDot === -1 ) {
		return '';
	}

	let tld = parseDomainAgainstTldList( domainName, wpcomMultiLevelTlds );

	if ( ! tld ) {
		tld = domainName.substring( lastIndexOfDot + 1 );
	}

	return tld;
}

function getTopLevelOfTld( domainName ) {
	return domainName.substring( domainName.lastIndexOf( '.' ) + 1 );
}

function getDomainProductSlug( domain ) {
	const tld = getTld( domain );
	const tldSlug = replace( tld, /\./g, 'dot' );

	if ( includes( [ 'com', 'net', 'org' ], tldSlug ) ) {
		return 'domain_reg';
	}

	return `dot${ tldSlug }_domain`;
}

function getUnformattedDomainPrice( slug, productsList ) {
	let price = get( productsList, [ slug, 'cost' ], null );

	if ( price ) {
		price += get( productsList, [ 'domain_map', 'cost' ], 0 );
	}

	return price;
}

function getDomainPrice( slug, productsList, currencyCode, stripZeros = false ) {
	let price = getUnformattedDomainPrice( slug, productsList );

	if ( price ) {
		price = formatCurrency( price, currencyCode, { stripZeros } );
	}

	return price;
}

function getUnformattedDomainSalePrice( slug, productsList ) {
	const saleCost = get( productsList, [ slug, 'sale_cost' ], null );
	const couponValidForNewDomainPurchase = get(
		productsList,
		[ slug, 'sale_coupon', 'allowed_for_new_purchases' ],
		null
	);

	if ( ! saleCost || ! couponValidForNewDomainPurchase ) {
		return null;
	}

	return saleCost;
}

function getDomainSalePrice( slug, productsList, currencyCode, stripZeros = false ) {
	let saleCost = getUnformattedDomainSalePrice( slug, productsList );

	if ( saleCost ) {
		saleCost = formatCurrency( saleCost, currencyCode, { stripZeros } );
	}

	return saleCost;
}

function getDomainTransferSalePrice( slug, productsList, currencyCode ) {
	const saleCost = get( productsList, [ slug, 'sale_cost' ], null );
	const couponValidForDomainTransfer = get(
		productsList,
		[ slug, 'sale_coupon', 'allowed_for_domain_transfers' ],
		null
	);

	if ( ! saleCost || ! couponValidForDomainTransfer ) {
		return null;
	}

	return formatCurrency( saleCost, currencyCode );
}

function getAvailableTlds( query = {} ) {
	return wpcom.undocumented().getAvailableTlds( query );
}

function getDomainTypeText( domain = {} ) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			return 'Mapped Domain';

		case domainTypes.REGISTERED:
			return 'Registered Domain';

		case domainTypes.SITE_REDIRECT:
			return 'Site Redirect';

		case domainTypes.WPCOM:
			return 'Default Site Domain';

		case domainTypes.TRANSFER:
			return 'Transfer';

		default:
			return '';
	}
}

/*
 * Given a search string, strip anything we don't want to query for domain suggestions
 *
 * @param {string} search Original search string
 * @param {integer} minLength Minimum search string length
 * @returns {string} Cleaned search string
 */
function getDomainSuggestionSearch( search, minLength = 2 ) {
	const cleanedSearch = getFixedDomainSearch( search );

	// Ignore any searches that are too short
	if ( cleanedSearch.length < minLength ) {
		return '';
	}

	// Ignore any searches for generic URL prefixes
	// getFixedDomainSearch will already have stripped http(s):// and www.
	const ignoreList = [ 'www', 'http', 'https' ];
	if ( includes( ignoreList, cleanedSearch ) ) {
		return '';
	}

	return cleanedSearch;
}

function resendIcannVerification( domainName, onComplete ) {
	return wpcom.undocumented().resendIcannVerification( domainName, onComplete );
}

function requestGdprConsentManagementLink( domainName, onComplete ) {
	return wpcom.undocumented().requestGdprConsentManagementLink( domainName, onComplete );
}

export {
	canRedirect,
	checkAuthCode,
	checkDomainAvailability,
	checkInboundTransferStatus,
	getDomainPrice,
	getDomainProductSlug,
	getDomainSalePrice,
	getDomainTransferSalePrice,
	getDomainTypeText,
	getFixedDomainSearch,
	getMappedDomains,
	getPrimaryDomain,
	getRegisteredDomains,
	getSelectedDomain,
	getTld,
	getTopLevelOfTld,
	getUnformattedDomainPrice,
	getUnformattedDomainSalePrice,
	hasMappedDomain,
	isHstsRequired,
	isMappedDomain,
	isMappedDomainWithWpcomNameservers,
	isRegisteredDomain,
	isSubdomain,
	resendInboundTransferEmail,
	startInboundTransfer,
	getAvailableTlds,
	getDomainSuggestionSearch,
	resendIcannVerification,
	requestGdprConsentManagementLink,
};
