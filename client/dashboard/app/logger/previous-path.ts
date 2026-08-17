import type { AnyRouter } from '@tanstack/react-router';

const previousPaths = new WeakMap< AnyRouter, string >();

// `router.state.resolvedLocation` is overwritten with the current location as
// soon as a navigation settles, so `onResolved`'s `fromLocation` is used
// instead. It is absent on the first load — a URL opened from outside the app.
export function trackPreviousPath( router: AnyRouter ) {
	return router.subscribe( 'onResolved', ( { fromLocation } ) => {
		if ( fromLocation ) {
			previousPaths.set( router, fromLocation.href );
		}
	} );
}

export function getPreviousPath( router: AnyRouter ) {
	return previousPaths.get( router );
}
