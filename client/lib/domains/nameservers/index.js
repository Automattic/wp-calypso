/**
 * External dependencies
 */
import update from 'react-addons-update';
import reject from 'lodash/reject';
import every from 'lodash/every';

const WPCOM_DEFAULTS = [
	'ns1.wordpress.com',
	'ns2.wordpress.com'
];

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

export {
	WPCOM_DEFAULTS,
	isWpcomDefaults,
	change,
	remove
};
