/**
 * External dependencies
 */
import inherits from 'inherits';
import some from 'lodash/collection/some';
import includes from 'lodash/collection/includes';
import find from 'lodash/collection/find';

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

function canAddGoogleApps( domain ) {
	var tld = domain.split( '.' )[ 1 ],
		includesBannedPhrase = some( GOOGLE_APPS_BANNED_PHRASES, function( phrase ) {
			return includes( domain, phrase );
		} );

	if ( includes( GOOGLE_APPS_INVALID_TLDS, tld ) || includesBannedPhrase ) {
		return false;
	}

	return true;
}

function canRegister( domain, onComplete ) {
	if ( ! domain ) {
		onComplete( new ValidationError( 'empty_query' ) );
		return;
	}

	wpcom.undocumented().isDomainAvailable( domain, function( serverError, data ) {
		var errorCode;
		if ( serverError ) {
			errorCode = serverError.error;
		} else if ( ! data.is_registrable ) {
			errorCode = 'not_registrable';
		} else if ( ! data.is_available && data.is_mappable ) {
			errorCode = 'not_available_but_mappable';
		} else if ( ! data.is_available ) {
			errorCode = 'not_available';
		}

		if ( errorCode ) {
			onComplete( new ValidationError( errorCode ) );
		} else {
			onComplete( null, data );
		}
	} );
}

function canMap( domain, onComplete ) {
	if ( ! domain ) {
		onComplete( new ValidationError( 'empty_query' ) );
		return;
	}

	wpcom.undocumented().isDomainMappable( domain, function( serverError, data ) {
		var errorCode;
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

function canRedirect( siteId, domain, onComplete ) {
	if ( ! domain ) {
		onComplete( new ValidationError( 'empty_query' ) );
		return;
	}

	wpcom.undocumented().canRedirect( siteId, domain, function( serverError, data ) {
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
	wpcom.undocumented().getPrimaryDomain( siteId, function( serverError, data ) {
		onComplete( serverError, data );
	} );
}

function getFixedDomainSearch( domain ) {
	return domain.trim().toLowerCase().replace( /^(https?:\/\/)?(www\.)?/, '' ).replace( /\/$/, '' );
}

function isSubdomain( domain ) {
	return domain.match( /\..+\.[a-z]{2,3}\.[a-z]{2}$|\..+\.[a-z]{3,}$|\..{4,}\.[a-z]{2}$/ );
}

function isInitialized( state, siteId ) {
	var siteState = state[ siteId ];
	return siteState && ( siteState.hasLoadedFromServer || siteState.isFetching );
}

function hasGoogleApps( domain ) {
	return domain.googleAppsSubscription.status !== 'no_subscription';
}

function getGoogleAppsSupportedDomains( domains ) {
	return domains.filter( function( domain ) {
		return ( domain.type === domainTypes.REGISTERED );
	} );
}

function canAddEmail( domains ) {
	return ( getGoogleAppsSupportedDomains( domains ).length > 0 );
}

function getSelectedDomain( { domains, selectedDomainName } ) {
	return find( domains.list, { name: selectedDomainName } );
}

function isRegisteredDomain( domain ) {
	return ( domain.type === domainTypes.REGISTERED );
}

export {
	canAddEmail,
	canAddGoogleApps,
	canMap,
	canRedirect,
	canRegister,
	getFixedDomainSearch,
	getGoogleAppsSupportedDomains,
	getPrimaryDomain,
	getSelectedDomain,
	hasGoogleApps,
	isInitialized,
	isRegisteredDomain,
	isSubdomain
};
