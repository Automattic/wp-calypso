/** @format */

/**
 * External dependencies
 */
import inherits from 'inherits';
import { includes, find, get, replace, some } from 'lodash';

/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import wpcom from 'lib/wp';
import { type as domainTypes, domainAvailability } from './constants';
import { parseDomainAgainstTldList } from './utils';
import wpcomMultiLevelTlds from './tlds/wpcom-multi-level-tlds.json';
import formatCurrency from 'lib/format-currency';

const GOOGLE_APPS_INVALID_TLDS = [ 'in' ];
const GOOGLE_APPS_BANNED_PHRASES = [ 'google' ];
const user = userFactory();

function ValidationError( code ) {
	this.code = code;
	this.message = code;
}

inherits( ValidationError, Error );

function canAddGoogleApps( domainName ) {
	const tld = domainName.split( '.' )[ 1 ],
		includesBannedPhrase = some( GOOGLE_APPS_BANNED_PHRASES, function( phrase ) {
			return includes( domainName, phrase );
		} );

	return ! (
		includes( GOOGLE_APPS_INVALID_TLDS, tld ) ||
		includesBannedPhrase ||
		isGsuiteRestricted()
	);
}

function isGsuiteRestricted() {
	return ! get( user.get(), 'is_valid_google_apps_country', false );
}

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

function restartInboundTransfer( siteId, domainName, onComplete ) {
	if ( ! domainName || ! siteId ) {
		onComplete( null );
		return;
	}

	wpcom.undocumented().restartInboundTransfer( siteId, domainName, function( serverError, result ) {
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
		.replace( /^(https?:\/\/)?(www\.)?/, '' )
		.replace( /^https?/, '' )
		.replace( /^www/, '' )
		.replace( /\/$/, '' )
		.replace( /_/g, '-' );
}

function isSubdomain( domainName ) {
	return domainName.match( /\..+\.[a-z]{2,3}\.[a-z]{2}$|\..+\.[a-z]{3,}$|\..{4,}\.[a-z]{2}$/ );
}

function hasGoogleApps( domain ) {
	return 'no_subscription' !== get( domain, 'googleAppsSubscription.status', '' );
}

function isMappedDomain( domain ) {
	return domain.type === domainTypes.MAPPED;
}

function getGoogleAppsSupportedDomains( domains ) {
	return domains.filter( function( domain ) {
		return (
			includes( [ domainTypes.REGISTERED, domainTypes.MAPPED ], domain.type ) &&
			canAddGoogleApps( domain.name )
		);
	} );
}

function hasGoogleAppsSupportedDomain( domains ) {
	return getGoogleAppsSupportedDomains( domains ).length > 0;
}

function hasPendingGoogleAppsUsers( domain ) {
	return get( domain, 'googleAppsSubscription.pendingUsers.length', 0 ) !== 0;
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
 * @return {string}                   The TLD or an empty string
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

function getDomainPrice( slug, productsList, currencyCode ) {
	let price = get( productsList, [ slug, 'cost' ], null );
	if ( price ) {
		price += get( productsList, [ 'domain_map', 'cost' ], 0 );
		price = formatCurrency( price, currencyCode );
	}

	return price;
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
			return 'Wpcom Domain';

		case domainTypes.TRANSFER:
			return 'Transfer';

		default:
			return '';
	}
}

export {
	canAddGoogleApps,
	canRedirect,
	checkAuthCode,
	checkDomainAvailability,
	checkInboundTransferStatus,
	getDomainPrice,
	getDomainProductSlug,
	getDomainTypeText,
	getFixedDomainSearch,
	getGoogleAppsSupportedDomains,
	getMappedDomains,
	getPrimaryDomain,
	getRegisteredDomains,
	getSelectedDomain,
	getTld,
	getTopLevelOfTld,
	hasGoogleApps,
	hasGoogleAppsSupportedDomain,
	hasMappedDomain,
	hasPendingGoogleAppsUsers,
	isGsuiteRestricted,
	isMappedDomain,
	isRegisteredDomain,
	isSubdomain,
	resendInboundTransferEmail,
	restartInboundTransfer,
	startInboundTransfer,
	getAvailableTlds,
};
