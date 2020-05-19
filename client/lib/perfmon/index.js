/**
 * External dependencies
 */
import { each, remove } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTiming } from 'lib/analytics/timing';
import { isEnabled } from 'config';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:perfmon' );

const PLACEHOLDER_CLASSES = [
	'placeholder',
	'pulsing-dot is-active',
	'is-loading',
	'is-processing',
];

const EXCLUDE_PLACEHOLDER_CLASSES = [
	'editor-drawer-well__placeholder', // used in featured image in editor
	'stats-page-placeholder__header',
	'stats-page-placeholder__content',
];

const PLACEHOLDER_MATCHER = PLACEHOLDER_CLASSES.map( ( clazz ) => `[class*='${ clazz }']` ).join(
	', '
);

const OBSERVE_ROOT = document.getElementById( 'wpcom' );

// specifies the mutations we are interested in: childList and class attr changes
const OBSERVE_OPTIONS = {
	subtree: true,
	attributes: true,
	childList: true,
	attributeFilter: [ 'class' ],
};

let mutationObserver = null;
let mutationObserverActive = false;

let navigationCount = 0;
let navigationStartTime = null;
let activePlaceholders = [];
let activePlaceholderEverDetected = false;

function processMutations( mutations ) {
	// record all the nodes that match our placeholder classes in the "activePlaceholders" array
	mutations.forEach( recordPlaceholders );

	// remove any nodes from activePlaceholders that are no longer placeholders
	// check each node for:
	// a. whether it's still in the DOM at all, and if so:
	// b. whether it still has a placeholder class
	remove(
		activePlaceholders,
		( node ) => ! OBSERVE_ROOT.contains( node ) || ! isPlaceholder( node )
	);

	checkActivePlaceholders();
}

function createMutationObserver() {
	const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	mutationObserver = new MutationObserver( processMutations );
}

// Start observing the DOM changes
function startMutationObserver() {
	if ( mutationObserver && ! mutationObserverActive ) {
		mutationObserver.observe( OBSERVE_ROOT, OBSERVE_OPTIONS );
		mutationObserverActive = true;
	}
}

// Stop observing the DOM changes and clean up all data structures
function stopMutationObserver() {
	if ( mutationObserver && mutationObserverActive ) {
		activePlaceholders = [];
		activePlaceholderEverDetected = false;
		mutationObserver.disconnect();
		mutationObserverActive = false;
	}
}

// Determine what kind of timing are we recording.
// Initial app load or after-load navigation to another route?
function determineTimingType() {
	if ( navigationCount > 1 ) {
		// This is navigation inside the single-page app after it was fully loaded.
		// Measure the time since the `page` router started displaying this page.
		return {
			startTime: navigationStartTime,
			trigger: 'navigation',
		};
	}

	// This is the initial load of the app. We measure the whole time the app needed to load.
	// `performance.now()` measures the time since "time origin", i.e., the start time is zero.
	// See https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#The_time_origin
	return {
		startTime: 0,
		trigger: 'initial',
	};
}

// Check if there are any placeholders on the screen and trigger a timing event
// when all the placeholders are gone
function checkActivePlaceholders() {
	const placeholdersCount = activePlaceholders.length;
	debug( `Checking active placeholders. Count: ${ placeholdersCount }` );

	if ( placeholdersCount > 0 ) {
		activePlaceholderEverDetected = true;
	}

	// record event if there ever were any placeholders and if they all just disappeared
	if ( activePlaceholderEverDetected && placeholdersCount === 0 ) {
		// tell tracks to record duration
		const { startTime, trigger } = determineTimingType();
		const duration = Math.round( window.performance.now() - startTime );
		debug( `Recording placeholder wait. Duration: ${ duration }, Trigger: ${ trigger }` );
		recordTiming( `placeholder-wait.${ trigger }`, duration );
		stopMutationObserver();
	}
}

function isPlaceholder( node ) {
	const className = node.className;
	return (
		className &&
		className.indexOf &&
		PLACEHOLDER_CLASSES.some( ( clazz ) => className.indexOf( clazz ) >= 0 ) &&
		! EXCLUDE_PLACEHOLDER_CLASSES.some( ( clazz ) => className.indexOf( clazz ) >= 0 )
	);
}

function recordPlaceholders( mutation ) {
	let nodes = [];

	if ( mutation.attributeName === 'class' ) {
		// mutation.type === 'attributes' is redundant
		nodes = [ mutation.target ];
	} else if ( mutation.type === 'childList' && mutation.addedNodes.length > 0 ) {
		nodes = mutation.addedNodes;
	} else {
		return;
	}

	each( nodes, function ( node ) {
		if ( isPlaceholder( node ) ) {
			recordPlaceholderNode( node );
		}

		// we need to find matching children because the mutation observer
		// only fires for the top element of an added subtree
		if ( node.querySelectorAll ) {
			// funky syntax because NodeList walks like an array but doesn't quack like one
			each( node.querySelectorAll( PLACEHOLDER_MATCHER ), recordPlaceholderNode );
		}
	} );
}

function recordPlaceholderNode( node ) {
	if ( activePlaceholders.indexOf( node ) >= 0 ) {
		// no-op
	} else {
		activePlaceholders.push( node );
	}
}

function platformFeaturesAvailable() {
	return (
		typeof window !== 'undefined' &&
		( window.MutationObserver || window.WebKitMutationObserver ) &&
		window.performance
	);
}

export function installPerfmonPageHandlers() {
	if ( ! isEnabled( 'perfmon' ) ) {
		return;
	}

	if ( ! platformFeaturesAvailable() ) {
		return;
	}

	page( function ( context, next ) {
		navigationCount++;
		navigationStartTime = window.performance.now();
		debug( 'entering page navigation', context.path );
		next();
	} );

	page.exit( function ( context, next ) {
		debug( 'exiting page navigation', context.path );
		stopMutationObserver();
		next();
	} );

	createMutationObserver();
}

export function recordPlaceholdersTiming() {
	startMutationObserver();
}
