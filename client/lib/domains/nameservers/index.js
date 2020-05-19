/**
 */

/**
 * External dependencies
 */
import update from 'immutability-helper';
import { every, reject } from 'lodash';

const WPCOM_DEFAULTS = [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ];

function isWpcomDefaults( nameservers ) {
	if ( nameservers.length === 0 ) {
		return false;
	}

	return every( nameservers, ( nameserver ) => {
		return /^ns[1-4]\.wordpress\.com$/i.test( nameserver );
	} );
}

function change( nameservers, index, changed ) {
	return update( nameservers, { [ index ]: { $set: changed } } );
}

function remove( nameservers, removedIndex ) {
	return reject( nameservers, ( _, index ) => index === removedIndex );
}

export { WPCOM_DEFAULTS, isWpcomDefaults, change, remove };
