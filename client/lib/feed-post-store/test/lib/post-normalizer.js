var clone = require( 'lodash/lang/clone' ),
	noop = require( 'lodash/utility/noop' );

function fakeNormalize( post, transforms, callback ) {
	callback( null, clone( post ) );
}

function noopFactory() {
	return noop;
}

[ 'safeImageProperties', 'withContentDOM', 'keepValidImages' ].forEach( function( prop ) {
	fakeNormalize[ prop ] = noopFactory;
} );

fakeNormalize.content = {};

[ 'safeContentImages' ].forEach( function( prop ) {
	fakeNormalize.content[ prop ] = noopFactory;
} );

module.exports = fakeNormalize;
