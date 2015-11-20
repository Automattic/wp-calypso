/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var path = require( './path' );

module.exports = assign( {
	untrailingslashit: require( './untrailingslashit' ),
	trailingslashit: require( './trailingslashit' ),
	redirect: require( './redirect' ),
	normalize: require( './normalize' )
}, path );
