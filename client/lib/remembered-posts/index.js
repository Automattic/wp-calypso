// Reader Site Block Store

// External Dependencies
//var debug = require( 'debug' )( 'calypso:reader:site-blocks' );

var Dispatcher = require( 'dispatcher' ),
	reject = require( 'lodash/reject' ),
	find = require( 'lodash/find' ),
	findLast = require( 'lodash/findLast' );

// Internal Dependencies
var emitter = require( 'lib/mixins/emitter' );

var RememberedPostsStore = {

	getIsRemembered: function( post ) {
		return false;
	},
};

emitter( RememberedPostsStore );

// Increase the max number of listeners from 10 to 100
RememberedPostsStore.setMaxListeners( 100 );

module.exports = RememberedPostsStore;
