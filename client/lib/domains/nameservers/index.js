/**
 * External dependencies
 */
import React from 'react';
import reject from 'lodash/collection/reject';
import constant from 'lodash/utility/constant';
import every from 'lodash/collection/every';

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
	return React.addons.update( nameservers, { [ index ]: { $set: changed } } );
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
