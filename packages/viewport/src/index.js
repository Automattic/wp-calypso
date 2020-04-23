// Determine whether a user is viewing calypso from a device within a
// particular mobile-first responsive breakpoint, matching our existing media
// queries. [1]
//
// This function takes a string matching one of our mobile-first breakpoints
// and returns a boolean based on whether the current `window.innerWidth`
// matches. This is used to segment behavior based on device or browser size,
// but should not be used in place of css for design.
//
// Valid breakpoints include:
// - '<480px'
// - '<660px'
// - '<800px'
// - '<960px'
// - '<1040px'
// - '<1280px'
// - '<1400px'
// - '>480px'
// - '>660px'
// - '>800px'
// - '>960px'
// - '>1040px'
// - '>1280px'
// - '>1400px'
// - '480px-660px'
// - '480px-960px'
// - '660px-960px'
//
// As implemented in our sass media query mixins, minimums are exclusive, while
// maximums are inclusive. i.e.,
//
// - '>480px' is equivalent to `@media (min-width: 481px)`
// - '<960px' is equivalent to `@media (max-width: 960px)`
// - '480px-960px' is equivalent to `@media (max-width: 960px) and (min-width: 481px)`
//
// [1] https://github.com/Automattic/wp-calypso/blob/master/docs/coding-guidelines/css.md#media-queries
//

// FIXME: We can't detect window size on the server, so until we have more intelligent detection,
// use 769, which is just above the general maximum mobile screen width.
const SERVER_WIDTH = 769;

export const MOBILE_BREAKPOINT = '<480px';
export const DESKTOP_BREAKPOINT = '>960px';

const isServer = typeof window === 'undefined' || ! window.matchMedia;

const noop = () => null;

function createMediaQueryList( { min, max } = {} ) {
	if ( min !== undefined && max !== undefined ) {
		return isServer
			? { matches: SERVER_WIDTH > min && SERVER_WIDTH <= max }
			: window.matchMedia( `(min-width: ${ min + 1 }px) and (max-width: ${ max }px)` );
	}

	if ( min !== undefined ) {
		return isServer
			? { matches: SERVER_WIDTH > min }
			: window.matchMedia( `(min-width: ${ min + 1 }px)` );
	}

	if ( max !== undefined ) {
		return isServer
			? { matches: SERVER_WIDTH <= max }
			: window.matchMedia( `(max-width: ${ max }px)` );
	}

	return false;
}

const mediaQueryLists = {
	'<480px': createMediaQueryList( { max: 480 } ),
	'<660px': createMediaQueryList( { max: 660 } ),
	'<800px': createMediaQueryList( { max: 800 } ),
	'<960px': createMediaQueryList( { max: 960 } ),
	'<1040px': createMediaQueryList( { max: 1040 } ),
	'<1280px': createMediaQueryList( { max: 1280 } ),
	'<1400px': createMediaQueryList( { max: 1400 } ),
	'>480px': createMediaQueryList( { min: 480 } ),
	'>660px': createMediaQueryList( { min: 660 } ),
	'>800px': createMediaQueryList( { min: 800 } ),
	'>960px': createMediaQueryList( { min: 960 } ),
	'>1040px': createMediaQueryList( { min: 1040 } ),
	'>1280px': createMediaQueryList( { min: 1280 } ),
	'>1400px': createMediaQueryList( { min: 1400 } ),
	'480px-660px': createMediaQueryList( { min: 480, max: 660 } ),
	'660px-960px': createMediaQueryList( { min: 660, max: 960 } ),
	'480px-960px': createMediaQueryList( { min: 480, max: 960 } ),
};

function getMediaQueryList( breakpoint ) {
	if ( ! mediaQueryLists.hasOwnProperty( breakpoint ) ) {
		try {
			// eslint-disable-next-line no-console
			console.warn( 'Undefined breakpoint used in `mobile-first-breakpoint`', breakpoint );
		} catch ( e ) {}
		return undefined;
	}

	return mediaQueryLists[ breakpoint ];
}

/**
 * Returns whether the current window width matches a breakpoint.
 *
 * @param {string} breakpoint The breakpoint to consider.
 *
 * @returns {boolean} Whether the provided breakpoint is matched.
 */
export function isWithinBreakpoint( breakpoint ) {
	const mediaQueryList = getMediaQueryList( breakpoint );
	return mediaQueryList ? mediaQueryList.matches : undefined;
}

/**
 * Registers a listener to be notified of changes to breakpoint matching status.
 *
 * @param {string} breakpoint The breakpoint to consider.
 * @param {Function} listener The listener to be called on change.
 *
 * @returns {Function} The function to be called when unsubscribing.
 */
export function subscribeIsWithinBreakpoint( breakpoint, listener ) {
	if ( ! listener ) {
		return noop;
	}

	const mediaQueryList = getMediaQueryList( breakpoint );

	if ( mediaQueryList && ! isServer ) {
		const wrappedListener = ( evt ) => listener( evt.matches );
		mediaQueryList.addListener( wrappedListener );
		// Return unsubscribe function.
		return () => mediaQueryList.removeListener( wrappedListener );
	}

	return noop;
}

/**
 * Returns whether the current window width matches the mobile breakpoint.
 *
 * @returns {boolean} Whether the mobile breakpoint is matched.
 */
export function isMobile() {
	return isWithinBreakpoint( MOBILE_BREAKPOINT );
}

/**
 * Registers a listener to be notified of changes to mobile breakpoint matching status.
 *
 * @param {Function} listener The listener to be called on change.
 *
 * @returns {Function} The registered subscription; undefined if none.
 */
export function subscribeIsMobile( listener ) {
	return subscribeIsWithinBreakpoint( MOBILE_BREAKPOINT, listener );
}

/**
 * Returns whether the current window width matches the desktop breakpoint.
 *
 * @returns {boolean} Whether the desktop breakpoint is matched.
 */
export function isDesktop() {
	return isWithinBreakpoint( DESKTOP_BREAKPOINT );
}

/**
 * Registers a listener to be notified of changes to desktop breakpoint matching status.
 *
 * @param {Function} listener The listener to be called on change.
 *
 * @returns {Function} The registered subscription; undefined if none.
 */
export function subscribeIsDesktop( listener ) {
	return subscribeIsWithinBreakpoint( DESKTOP_BREAKPOINT, listener );
}

/**
 * Returns the current window width.
 * Avoid using this method, as it triggers a layout recalc.
 *
 * @returns {number} The current window width, in pixels.
 */
export function getWindowInnerWidth() {
	return isServer ? SERVER_WIDTH : window.innerWidth;
}
