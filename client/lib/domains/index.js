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
import { type as domainTypes, domainAvailability } from './constants';

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

function checkDomainAvailability( domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( null, { status: domainAvailability.EMPTY_QUERY } );
		return;
	}

	wpcom.undocumented().isDomainAvailable( domainName, function( serverError, result ) {
		if ( serverError ) {
			onComplete( serverError.error );
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
	canRedirect,
	checkDomainAvailability,
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
