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
	signup: () => import( /* webpackChunkName: "lib-analytics-signup" */ 'lib/analytics/signup' ),
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

/**
 * Add an item to the analytics queue.
 *
 * @param {string} moduleName the name of the module where the queued method exists, e.g. `signup`.
 * See the `modules` constant at the top of this file (`lib/analytics/queue.js`).
 * @param {string} trigger the exported function in the chosen module to be run, e.g. `recordSignupStart` in `signup`.
 * @param  {...any} args the arguments to be passed to the chosen function. Optional.
 */
export function addToQueue( moduleName, trigger, ...args ) {
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

/**
 * Process the existing analytics queue, by running any pending triggers and clearing it.
 */
export function processQueue() {
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
