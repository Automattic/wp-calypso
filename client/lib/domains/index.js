/**
 * External dependencies
 */
import inherits from 'inherits';
import {
	some,
	includes,
	find
} from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { type as domainTypes } from './constants';

const GOOGLE_APPS_INVALID_TLDS = [ 'in' ],
	GOOGLE_APPS_BANNED_PHRASES = [ 'google' ];

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

	return ! ( includes( GOOGLE_APPS_INVALID_TLDS, tld ) || includesBannedPhrase );
}

function canRegister( domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( new ValidationError( 'empty_query' ) );
		return;
	}

	wpcom.undocumented().isDomainAvailable( domainName, function( serverError, data ) {
		if ( serverError ) {
			onComplete( new ValidationError( serverError.error ) );
			return;
		}

		const {
			is_available: isAvailable,
			is_mappable: isMappable,
			is_registrable: isRegistrable,
			unmappability_reason: unmappabilityReason
		} = data;

		let errorCode;
		if ( ! isMappable ) {
			errorCode = 'not_mappable';
			if ( unmappabilityReason ) {
				errorCode += `_${ unmappabilityReason }`;
			}
		} else if ( ! isAvailable && isMappable ) {
			errorCode = 'not_available_but_mappable';
		} else if ( isAvailable && ! isRegistrable ) {
			errorCode = 'available_but_not_registrable';
		}

		if ( errorCode ) {
			onComplete( new ValidationError( errorCode ) );
		} else {
			onComplete( null, data );
		}
	} );
}

function canMap( domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( new ValidationError( 'empty_query' ) );
		return;
	}

	wpcom.undocumented().isDomainMappable( domainName, function( serverError, data ) {
		let errorCode;
		if ( serverError ) {
			errorCode = serverError.error;
		} else if ( ! data.is_mappable ) {
			errorCode = 'not_mappable';
		}

		if ( errorCode ) {
			onComplete( new ValidationError( errorCode ) );
		} else {
			onComplete( null );
		}
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
	return domainName.trim().toLowerCase().replace( /^(https?:\/\/)?(www\.)?/, '' ).replace( /\/$/, '' );
}

function isSubdomain( domainName ) {
	return domainName.match( /\..+\.[a-z]{2,3}\.[a-z]{2}$|\..+\.[a-z]{3,}$|\..{4,}\.[a-z]{2}$/ );
}

function isInitialized( state, siteId ) {
	const siteState = state[ siteId ];
	return siteState && ( siteState.hasLoadedFromServer || siteState.isFetching );
}

function hasGoogleApps( domain ) {
	return domain.googleAppsSubscription.status !== 'no_subscription';
}

function isMappedDomain( domain ) {
	return domain.type === domainTypes.MAPPED;
}

function getGoogleAppsSupportedDomains( domains ) {
	return domains.filter( function( domain ) {
		return ( includes( [ domainTypes.REGISTERED, domainTypes.MAPPED ], domain.type ) && canAddGoogleApps( domain.name ) );
	} );
}

function hasGoogleAppsSupportedDomain( domains ) {
	return getGoogleAppsSupportedDomains( domains ).length > 0;
}

function hasPendingGoogleAppsUsers( domain ) {
	return domain.googleAppsSubscription &&
		domain.googleAppsSubscription.pendingUsers &&
		domain.googleAppsSubscription.pendingUsers.length !== 0;
}

function getSelectedDomain( { domains, selectedDomainName } ) {
	return find( domains.list, { name: selectedDomainName } );
}

function isRegisteredDomain( domain ) {
	return ( domain.type === domainTypes.REGISTERED );
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

function getTld( domainName ) {
	const lastIndexOfDot = domainName.lastIndexOf( '.' );

	return lastIndexOfDot !== -1 && domainName.substring( lastIndexOfDot + 1 );
}

export {
	canAddGoogleApps,
	canMap,
	canRedirect,
	canRegister,
	getFixedDomainSearch,
	getGoogleAppsSupportedDomains,
	getPrimaryDomain,
	getSelectedDomain,
	getRegisteredDomains,
	getMappedDomains,
	getTld,
	hasGoogleApps,
	hasGoogleAppsSupportedDomain,
	hasMappedDomain,
	hasPendingGoogleAppsUsers,
	isInitialized,
	isRegisteredDomain,
	isSubdomain
};
