/**
 * Dependencies we would like to like in the vendor chunk. These can be external or internal deps, but either way,
 * they should be things that the majority of the application uses, and things that don't change very often.
 */
require( 'classnames' );
require( 'debug' );
require( 'i18n-calypso' );
// lodash would go here, but we leave it out because we use tree shaking to only require the bits that we use.
require( 'moment' );
require( 'page' );
require( 'react-redux' );
require( 'react' );
require( 'redux' );
require( 'store' );
require( 'wpcom' );
