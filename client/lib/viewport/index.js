/** @format */
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

export function isWithinBreakpoint( breakpoint ) {
	const screenWidth = getWindowInnerWidth(),
		breakpoints = {
			'<480px': () => screenWidth <= 480,
			'<660px': () => screenWidth <= 660,
			'<800px': () => screenWidth <= 800,
			'<960px': () => screenWidth <= 960,
			'<1040px': () => screenWidth <= 1040,
			'<1280px': () => screenWidth <= 1280,
			'<1400px': () => screenWidth <= 1400,
			'>480px': () => screenWidth > 480,
			'>660px': () => screenWidth > 660,
			'>800px': () => screenWidth > 800,
			'>960px': () => screenWidth > 960,
			'>1040px': () => screenWidth > 1040,
			'>1280px': () => screenWidth > 1280,
			'>1400px': () => screenWidth > 1400,
			'480px-660px': () => screenWidth > 480 && screenWidth <= 660,
			'660px-960px': () => screenWidth > 660 && screenWidth <= 960,
			'480px-960px': () => screenWidth > 480 && screenWidth <= 960,
		};

	if ( ! breakpoints.hasOwnProperty( breakpoint ) ) {
		try {
			// eslint-disable-next-line no-console
			console.warn( 'Undefined breakpoint used in `mobile-first-breakpoint`', breakpoint );
		} catch ( e ) {}
		return undefined;
	}
	return breakpoints[ breakpoint ]();
}

export function isMobile() {
	return isWithinBreakpoint( '<480px' );
}

export function isDesktop() {
	return isWithinBreakpoint( '>960px' );
}

// FIXME: We can't detect window size on the server, so until we have more intelligent detection,
// use 769, which is just above the general maximum mobile screen width.
export function getWindowInnerWidth() {
	return typeof window !== 'undefined' ? window.innerWidth : 769;
}
