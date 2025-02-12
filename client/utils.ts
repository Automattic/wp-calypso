import page, { Context } from '@automattic/calypso-router';
import { addQueryArgs } from 'calypso/lib/url';
// Adapts route paths to also include wildcard
// subroutes under the root level section.

export function pathToRegExp( path: string ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

export function debounce< T, U >( callback: ( ...args: T[] ) => U, timeout: number ) {
	let timeoutId: number | undefined = undefined;
	return ( ...args: T[] ) => {
		window.clearTimeout( timeoutId );
		timeoutId = window.setTimeout( () => {
			callback( ...args );
		}, timeout );
	};
}

export function redirectToLaunchpad(
	siteSlug: string,
	launchpadFlow: string,
	verifiedParam: boolean
) {
	const launchpadRedirectionURL = addQueryArgs(
		{
			siteSlug,
			verified: verifiedParam ? 1 : undefined,
		},
		`/setup/${ launchpadFlow }/launchpad`
	);
	window.location.replace( launchpadRedirectionURL );
}

/**
 * The function calculates does the user fall into
 * the provided percentage of people for product sampling?
 * @param userId Number
 * @param percentage Number
 * @returns {boolean}
 */
export function isEligibleForProductSampling( userId: number, percentage: number ) {
	if ( percentage >= 100 ) {
		return true;
	}
	const userSegment = userId % 100;

	return userSegment < percentage;
}

export function getRouteFromContext( context: Context ) {
	let route = context.path;
	for ( const [ key, value ] of Object.entries( context.params ) ) {
		if ( key !== '0' ) {
			route = route.replace( value, ':' + key );
		}
	}
	return route;
}

export interface RedirectRouteList {
	path: string;
	regex?: RegExp;
	getRedirect: ( params?: Record< string, string > ) => string;
}

/**
 * Setup redirect routes for the provided list of routes.
 */
export function setupRedirectRoutes( redirectRouteList: RedirectRouteList[] ): void {
	redirectRouteList.forEach( ( { path, regex, getRedirect } ): void => {
		// Get the URL query parameters to append to the new URL.
		const urlQueryParams = location.search;

		// If no regex is provided, just redirect to the new URL.
		if ( ! regex ) {
			page( path, getRedirect() + urlQueryParams );
			return;
		}

		// If a regex is provided, redirect to the new URL by extracting the parameters from the URL.
		page( path, ( context, next ): void => {
			if ( context.path.match( regex ) ) {
				page.redirect( getRedirect( context.params ) + urlQueryParams );
			}

			next();
		} );
	} );
}
