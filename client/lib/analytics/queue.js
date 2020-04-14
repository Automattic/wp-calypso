// This is a `localStorage` queue for delayed event triggers.

/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Module variables
 */
const queueDebug = debug( 'calypso:analytics:queue' );

// The supported modules for which queue triggers can be set up.
// We use a layer of indirection to avoid loading the modules until they're needed.
const modules = {
	signup: () => import( 'lib/analytics/signup' ),
};

const lsKey = () => 'analyticsQueue';

function clear() {
	if ( ! window.localStorage ) {
		return; // Not possible.
	}

	window.localStorage.removeItem( lsKey() );
}

function get() {
	if ( ! window.localStorage ) {
		return []; // Not possible.
	}

	let items = window.localStorage.getItem( lsKey() );

	items = items ? JSON.parse( items ) : [];
	items = Array.isArray( items ) ? items : [];

	return items;
}

function runTrigger( moduleName, trigger, ...args ) {
	if ( 'string' === typeof trigger && 'function' === typeof modules[ moduleName ] ) {
		modules[ moduleName ]().then( ( mod ) => {
			if ( 'function' === typeof mod[ trigger ] ) {
				mod[ trigger ].apply( null, args || undefined );
			}
		} );
	}
	return; // Not possible.
}

export function add( moduleName, trigger, ...args ) {
	if ( ! window.localStorage ) {
		// If unable to queue, trigger it now.
		return runTrigger( moduleName, trigger, ...args );
	}

	let items = get();
	const newItem = { moduleName, trigger, args };

	items.push( newItem );
	items = items.slice( -100 ); // Upper limit.

	queueDebug( 'Adding new item to queue.', newItem );
	window.localStorage.setItem( lsKey(), JSON.stringify( items ) );
}

export function process() {
	if ( ! window.localStorage ) {
		return; // Not possible.
	}

	const items = get();
	clear();

	queueDebug( 'Processing items in queue.', items );

	items.forEach( ( item ) => {
		if ( 'object' === typeof item && 'string' === typeof item.trigger ) {
			queueDebug( 'Processing item in queue.', item );
			runTrigger( item.moduleName, item.trigger, ...item.args );
		}
	} );
}
