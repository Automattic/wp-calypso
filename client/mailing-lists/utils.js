/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:mailing-lists' );

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

export default {
	deleteSubscriber( category, emailAddress, hmac, context ) {
		return new Promise( function ( resolve, reject ) {
			wpcom
				.undocumented()
				.mailingList( category )
				.unsubscribe( emailAddress, hmac, context, function ( err, result ) {
					if ( err ) {
						debug( err );
						reject( err );
						return;
					}

					resolve( result );
				} );
		} );
	},

	addSubscriber( category, emailAddress, hmac, context ) {
		return new Promise( function ( resolve, reject ) {
			wpcom
				.undocumented()
				.mailingList( category )
				.subscribe( emailAddress, hmac, context, function ( err, result ) {
					if ( err ) {
						debug( err );
						reject( err );
						return;
					}

					resolve( result );
				} );
		} );
	},
};
