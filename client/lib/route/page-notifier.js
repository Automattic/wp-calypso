/** @format */
/*eslint no-multi-spaces: 0*/
// node dependency
var EventEmitter = require( 'events' ).EventEmitter;

// internal dependency
var page = require( 'page' );
var Route = page.Route;

// routing state and middleware
var location = new EventEmitter();
var currentContext = null;
var route = new Route( '*' );

// Inject our route at the front so we are always called
page.callbacks.unshift(
	route.middleware( function( context, next ) {
		next();
		location.emit( 'change', context, currentContext );
		currentContext = context;
	} )
);

// Export a function that attaches a listener to the location change event
// If a page has already been rendered the listener will be called with
// the current page's context.
module.exports = function observe( listener ) {
	location.on( 'change', listener );
	if ( currentContext ) {
		listener( currentContext );
	}
	return location;
};
