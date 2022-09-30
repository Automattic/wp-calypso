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
	emailVerifiedParam: boolean
) {
	let launchpadRedirectionURL = `/setup/launchpad?flow=${ launchpadFlow }&siteSlug=${ siteSlug }`;
	if ( emailVerifiedParam ) {
		launchpadRedirectionURL = addQueryArgs(
			{
				emailVerified: 1,
			},
			launchpadRedirectionURL
		);
	}
	window.location.replace( launchpadRedirectionURL );
}

/**
 * The function calculates does the user fall into
 * the provided percentage of people for product sampling?
 *
 * @param userId Number
 * @param percentage Number
 * @returns {boolean}
 */
export function isEligibleForProductSampling( userId: number, percentage: number ) {
	if ( percentage >= 100 ) return true;
	const userSegment = userId % 100;

	return userSegment < percentage;
}
