/**
 * External dependencies
 */
import inherits from 'inherits';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

function ValidationError( code ) {
	this.code = code;
	this.message = code;
}

inherits( ValidationError, Error );

export function canRedirect( siteId, domainName, onComplete ) {
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

	wpcom.undocumented().canRedirect( siteId, domainName, function ( serverError, data ) {
		if ( serverError ) {
			onComplete( new ValidationError( serverError.error ) );
		} else if ( ! data.can_redirect ) {
			onComplete( new ValidationError( 'cannot_redirect' ) );
		} else {
			onComplete( null );
		}
	} );
}
