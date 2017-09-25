/*eslint no-multi-spaces: 0*/
// node dependency
import { EventEmitter } from 'events';

// internal dependency
import page from 'page';

const Route          = page.Route;

// routing state and middleware
const location       = new EventEmitter();
let currentContext = null;
const route          = new Route( '*' );

// Inject our route at the front so we are always called
page.callbacks.unshift( route.middleware( function( context, next ) {
	next();
	location.emit( 'change', context, currentContext );
	currentContext = context;
} ) );

// Export a function that attaches a listener to the location change event
// If a page has already been rendered the listener will be called with
// the current page's context.
export default function observe( listener ) {
	location.on( 'change', listener );
	if ( currentContext ) {
		listener( currentContext );
	}
	return location;
}
