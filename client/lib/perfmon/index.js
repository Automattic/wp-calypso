/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

/**
 * External dependencies
 */
import each from 'lodash/each';
import remove from 'lodash/remove';
import debounce from 'lodash/debounce';
import page from 'page';

var debug = require( 'debug' )( 'calypso:perfmon' );

const PLACEHOLDER_CLASSES = [
	'placeholder',
	'pulsing-dot is-active',
	'is-loading',
	'is-processing'
];

const EXCLUDE_PLACEHOLDER_CLASSES = [
	'editor-drawer-well__placeholder' // used in featured image in editor
];

const PLACEHOLDER_MATCHER = PLACEHOLDER_CLASSES.map(function(clazz) { return `[class*='${clazz}']`; }).join(', ');
const OBSERVE_ROOT = document.getElementById('wpcom');

let activePlaceholders = [];
let placeholdersVisibleStart = null;
let initialized = false;

// add listeners for various DOM events - scrolling, mutation and navigation
// and use these to trigger checks for visible placeholders (and, in the case of mutations,
// to record new placeholders and remove nodes that are no longer placeholders)
function observeDomChanges( MutationObserver ) {
	// if anything scrolls, check if any of our placeholder elements are in view,
	// but not more than a few times a second
	window.addEventListener('scroll', debounce(checkForVisiblePlaceholders.bind(null, 'scroll'), 200), true);

	// if the user navigates, stop the current event and proceed to the next one
	page( function( context, next ) {
		// send "placeholder-wait-navigated" event
		checkForVisiblePlaceholders( 'navigate' );
		next();
	} );

	// this is fired for matching mutations (childList and class attr changes)
	var observer = new MutationObserver( function( mutations ) {
		// record all the nodes that match our placeholder classes in the "activePlaceholders" array
		mutations.forEach( recordPlaceholders );

		// remove any nodes from activePlaceholders that are no longer placeholders
		// check each node for:
		// a. whether it's still in the DOM at all, and if so:
		// b. whether it still has a placeholder class
		remove( activePlaceholders, function( node ) {
			return ! OBSERVE_ROOT.contains( node ) || ! isPlaceholder( node );
		} );

		checkForVisiblePlaceholders( 'mutation' );

	} );

	observer.observe( OBSERVE_ROOT, {
	  subtree: true,
	  attributes: true,
	  childList: true,
	  attributeFilter: ['class']
	} );
}

// check if there are any placeholders on the screen,
// and trigger a timing event when all the placeholders are gone or the user
// has navigated
function checkForVisiblePlaceholders( trigger ) {
	// determine how many placeholders are active in the viewport
	const visibleCount = activePlaceholders.reduce(
		function( count, node ) {
			return count + ( isElementVisibleInViewport( node ) ? 1 : 0 );
		}, 0
	);

	// record event and reset timer if all placeholders are loaded OR user has just navigated
	if ( placeholdersVisibleStart && ( visibleCount === 0 || trigger === 'navigate' ) ) {
		// tell tracks to record duration
		var duration = parseInt(performance.now() - placeholdersVisibleStart, 10);
		debug(`Recording placeholder wait. Duration: ${duration}, Trigger: ${trigger}`);
		analytics.timing.record( `placeholder-wait`, duration, trigger );
		placeholdersVisibleStart = visibleCount === 0 ? null : performance.now();
	}

	// if we can see placeholders, placeholdersVisibleStart is falsy, start the clock
	if ( visibleCount > 0 && !placeholdersVisibleStart ) {
		placeholdersVisibleStart = performance.now(); // TODO: performance.now()?
	}

	// if there are placeholders hanging around, print some useful stats
	if ( activePlaceholders.length > 0 ) {
		debug("Active placeholders: "+activePlaceholders.length);
		debug("Visible in viewport: "+visibleCount);
	}
}

function isPlaceholder( node ) {
	var className = node.className;
	return className && className.indexOf
		&& PLACEHOLDER_CLASSES.some( function( clazz ) {
			return (className.indexOf( clazz ) >= 0);
		} )
		&& !EXCLUDE_PLACEHOLDER_CLASSES.some( function( clazz ) {
			return (className.indexOf( clazz ) >= 0);
		} );
}

// adapted from http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementVisibleInViewport( node ) {
	var rect = node.getBoundingClientRect();

	// discard if width or height are zero
	if ( (rect.top - rect.bottom) === 0 || (rect.right - rect.left) === 0) {
		return false;
	}

	var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
	var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

	// if top or bottom are inside window, AND left or right edge are inside window, then
	// the element is at least partially visible
	return (
		( ( rect.top >= 0 && rect.top <= windowHeight ) || ( rect.bottom >= 0 && rect.bottom <= windowHeight ) ) &&
		( ( rect.left >= 0 && rect.left <= windowWidth ) || ( rect.right >= 0 && rect.right <= windowWidth  ) )
	);
}

function recordPlaceholders( mutation ) {
	var nodes = [];

	if ( mutation.attributeName === 'class' ) { // mutation.type === 'attributes' is redundant
		nodes = [mutation.target];
	} else if ( mutation.type === 'childList' && mutation.addedNodes.length > 0 ) {
		nodes = mutation.addedNodes;
	} else {
		return;
	}

	each( nodes, function( node ) {

		if ( isPlaceholder( node ) ) {
			recordPlaceholderNode( node );
		}

		// we need to find matching children because the mutation observer
		// only fires for the top element of an added subtree
		if ( node.querySelectorAll ) {
			// funky syntax because NodeList walks like an array but doesn't quack like one
			each( node.querySelectorAll(PLACEHOLDER_MATCHER), recordPlaceholderNode );
		}
	} );
}

function recordPlaceholderNode( node ) {
	if ( activePlaceholders.indexOf( node ) >= 0 ) {
		// no-op
	} else {
		activePlaceholders.push(node);
	}
}

module.exports = function() {
	if ( !initialized ) {
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		if ( MutationObserver && window.performance ) {
			observeDomChanges( MutationObserver );
		}

		initialized = true;
	}
};
