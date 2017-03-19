/**
 * External dependencies
 */
var assign = require( 'lodash/assign' );

/**
 * Internal dependencies
 */
var path = require( './path' );

export default assign( {
	untrailingslashit: require( './untrailingslashit' ),
	trailingslashit: require( './trailingslashit' ),
	redirect: require( './redirect' ),
	normalize: require( './normalize' ),
	addQueryArgs: require( './add-query-args' )
}, path );
