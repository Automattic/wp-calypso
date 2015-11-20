/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' );

/**
 * Module variables
 */
var PostFormatsStore = {},
	_formats = {};

emitter( PostFormatsStore );

function receivePostFormats( siteId, data ) {
	_formats[ siteId ] = Object.keys( data ).map( function( slug ) {
		return {
			slug: slug,
			label: data[ slug ]
		};
	} );
}

PostFormatsStore.get = function( siteId ) {
	return _formats[ siteId ];
};

PostFormatsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'RECEIVE_POST_FORMATS':
			if ( ! action.error && action.siteId && action.data ) {
				receivePostFormats( action.siteId, action.data );
				PostFormatsStore.emit( 'change' );
			}
			break;
	}
} );

module.exports = PostFormatsStore;
