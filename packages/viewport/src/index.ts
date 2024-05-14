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
// [1] https://github.com/Automattic/wp-calypso/blob/HEAD/docs/coding-guidelines/css.md#media-queries
//

// FIXME: We can't detect window size on the server, so until we have more intelligent detection,
// use 769, which is just above the general maximum mobile screen width.
const SERVER_WIDTH = 769;

export const MOBILE_BREAKPOINT = '<480px';
export const DESKTOP_BREAKPOINT = '>960px';
export const WIDE_BREAKPOINT = '>1280px';

const isServer = typeof window === 'undefined' || ! window.matchMedia;

const noop = () => null;

export type QueryOption = { min?: number; max?: number };
export type QueryItem = false | MinimalMediaQueryList | MediaQueryList;
export type ListenerCallback = ( matches: boolean ) => void;
export type UnsubcribeCallback = () => void;
export type MinimalMediaQueryList = {
	matches: boolean;
	addListener: MediaQueryList[ 'addListener' ];
	removeListener: MediaQueryList[ 'removeListener' ];
};

function addListenerFunctions(
	obj: Pick< MinimalMediaQueryList, 'matches' >
): MinimalMediaQueryList {
	return {
		addListener: () => undefined,
		removeListener: () => undefined,
		...obj,
	};
}

function createMediaQueryList( args?: QueryOption ): QueryItem {
	const { min, max } = args ?? {};
	if ( min !== undefined && max !== undefined ) {
		return isServer
			? addListenerFunctions( { matches: SERVER_WIDTH > min && SERVER_WIDTH <= max } )
			: window.matchMedia( `(min-width: ${ min + 1 }px) and (max-width: ${ max }px)` );
	}

	if ( min !== undefined ) {
		return isServer
			? addListenerFunctions( { matches: SERVER_WIDTH > min } )
			: window.matchMedia( `(min-width: ${ min + 1 }px)` );
	}

	if ( max !== undefined ) {
		return isServer
			? addListenerFunctions( { matches: SERVER_WIDTH <= max } )
			: window.matchMedia( `(max-width: ${ max }px)` );
	}

	return false;
}

// @todo We should algin the behavior with the `break-*` mixins from Gutenberg to include minimums
// See https://github.com/WordPress/gutenberg/blob/f1d0bd550f85f5fa4279a3fdb9a2b9c28a7544c6/packages/base-styles/_mixins.scss#L27
const mediaQueryOptions: Record< string, QueryOption > = {
	'<480px': { max: 480 },
	'<660px': { max: 660 },
	'<782px': { max: 782 },
	'<800px': { max: 800 },
	'<960px': { max: 960 },
	'<1040px': { max: 1040 },
	'<1180px': { max: 1180 },
	'<1280px': { max: 1280 },
	'<1400px': { max: 1400 },
	'>480px': { min: 480 },
	'>660px': { min: 660 },
	'>=782px': { min: 781 },
	'>782px': { min: 782 },
	'>800px': { min: 800 },
	'>=960px': { min: 959 },
	'>960px': { min: 960 },
	'>1040px': { min: 1040 },
	'>1280px': { min: 1280 },
	'>1400px': { min: 1400 },
	'480px-660px': { min: 480, max: 660 },
	'660px-960px': { min: 660, max: 960 },
	'480px-960px': { min: 480, max: 960 },
};

export function getMediaQueryList( breakpoint: string ): undefined | QueryItem {
	if ( ! mediaQueryOptions.hasOwnProperty( breakpoint ) ) {
		try {
			// eslint-disable-next-line no-console
			console.warn( 'Undefined breakpoint used in `mobile-first-breakpoint`', breakpoint );
		} catch ( e ) {}
		return undefined;
	}

	return createMediaQueryList( mediaQueryOptions[ breakpoint ] );
}

/**
 * Returns whether the current window width matches a breakpoint.
 * @param {string} breakpoint The breakpoint to consider.
 * @returns {boolean|undefined} Whether the provided breakpoint is matched.
 */
export function isWithinBreakpoint( breakpoint: string ): boolean | undefined {
	const mediaQueryList = getMediaQueryList( breakpoint );
	return mediaQueryList ? mediaQueryList.matches : undefined;
}

/**
 * Registers a listener to be notified of changes to breakpoint matching status.
 * @param {string} breakpoint The breakpoint to consider.
 * @param {Function} listener The listener to be called on change.
 * @returns {Function} The function to be called when unsubscribing.
 */
export function subscribeIsWithinBreakpoint(
	breakpoint: string,
	listener: ListenerCallback
): UnsubcribeCallback {
	if ( ! listener ) {
		return noop;
	}

	const mediaQueryList = getMediaQueryList( breakpoint );

	if ( mediaQueryList && ! isServer ) {
		const wrappedListener = ( evt: { matches: boolean } ) => listener( evt.matches );
		mediaQueryList.addListener( wrappedListener );
		// Return unsubscribe function.
		return () => mediaQueryList.removeListener( wrappedListener );
	}

	return noop;
}

/**
 * Returns whether the current window width matches the mobile breakpoint.
 * @returns {boolean|undefined} Whether the mobile breakpoint is matched.
 */
export function isMobile(): boolean | undefined {
	return isWithinBreakpoint( MOBILE_BREAKPOINT );
}

/**
 * Registers a listener to be notified of changes to mobile breakpoint matching status.
 * @param {Function} listener The listener to be called on change.
 * @returns {Function} The registered subscription; undefined if none.
 */
export function subscribeIsMobile( listener: ListenerCallback ): UnsubcribeCallback {
	return subscribeIsWithinBreakpoint( MOBILE_BREAKPOINT, listener );
}

/**
 * Returns whether the current window width matches the desktop breakpoint.
 * @returns {boolean|undefined} Whether the desktop breakpoint is matched.
 */
export function isDesktop(): boolean | undefined {
	return isWithinBreakpoint( DESKTOP_BREAKPOINT );
}

/**
 * Registers a listener to be notified of changes to desktop breakpoint matching status.
 * @param {Function} listener The listener to be called on change.
 * @returns {Function} The registered subscription; undefined if none.
 */
export function subscribeIsDesktop( listener: ListenerCallback ): UnsubcribeCallback {
	return subscribeIsWithinBreakpoint( DESKTOP_BREAKPOINT, listener );
}

/**
 * Returns the current window width.
 * Avoid using this method, as it triggers a layout recalc.
 * @returns {number} The current window width, in pixels.
 */
export function getWindowInnerWidth(): number {
	return isServer ? SERVER_WIDTH : window.innerWidth;
}

/******************************************/
/*       Vertical Scroll Experiment       */
/*  	       pcbrnV-XN-p2               */
/******************************************/

//TODO: To be refactored using above using the DESKTOP_BREAKPOINT constant
export function isTabletResolution(): boolean {
	if ( ! isServer ) {
		return window.innerWidth < 1040;
	}
	return false;
}

export const DEVICE_MOBILE = 'mobile';
export const DEVICE_TABLET = 'tablet';
export const DEVICE_DESKTOP = 'desktop';

export function resolveDeviceTypeByViewPort(): string {
	if ( isMobile() ) {
		return DEVICE_MOBILE;
	} else if ( isTabletResolution() ) {
		return DEVICE_TABLET;
	}
	return DEVICE_DESKTOP;
}

/******************************************/
