/**
 * External dependencies
 */
var rewire = require( 'rewire' ),
	assign = require( 'lodash/assign' );

/**
 * Internal dependencies
 */
var flows = rewire( '../../../../signup/config/flows' );

flows.__set__( 'flows', {
	main: {
		steps: [ 'user', 'site' ],
		destination: '/'
	},

	account: {
		steps: [ 'user', 'site' ],
		destination: '/'
	},

	other: {
		steps: [ 'user', 'site' ],
		destination: '/'
	},

	filtered: {
		steps: [ 'user', 'site' ],
		destination: '/'
	}
} );

module.exports = assign( {}, flows, { defaultFlowName: 'main' } );
