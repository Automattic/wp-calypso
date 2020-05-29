/**
 * External dependencies
 */
const { configure } = require( 'enzyme' );
const Adapter = require( 'enzyme-adapter-react-16' );

// this should trigger building packages
configure( { adapter: new Adapter() } );
