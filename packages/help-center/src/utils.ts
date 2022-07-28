/* eslint-disable no-restricted-imports */
import { isWpMobileApp } from 'calypso/lib/mobile-app';

// list of valid origins for wpcom requests.
// taken from wpcom-proxy-request (rest-proxy/provider-v2.0.js)
const wpcomAllowedOrigins = [
	'https://wordpress.com',
	'https://cloud.jetpack.com',
	'http://wpcalypso.wordpress.com', // for running docker on dev instances
	'http://widgets.wp.com',
	'https://widgets.wp.com',
	'https://dev-mc.a8c.com',
	'https://mc.a8c.com',
	'https://dserve.a8c.com',
	'http://calypso.localhost:3000',
	'https://calypso.localhost:3000',
	'http://jetpack.cloud.localhost:3000',
	'https://jetpack.cloud.localhost:3000',
	'http://calypso.localhost:3001',
	'https://calypso.localhost:3001',
	'https://calypso.live',
	'http://127.0.0.1:41050',
	'http://send.linguine.localhost:3000',
];
// function that tells us if we want to show the Help Center to the user, given that we're showing it to
// only a certain percentage of users.
export function shouldShowHelpCenterToUser( userId: number ) {
	const currentSegment = 10; //percentage of users that will see the Help Center, not the FAB
	const userSegment = userId % 100;
	return userSegment < currentSegment;
}

/**
 * Shelved from rest-proxy/provider-v2.0.js.
 * This returns true for all WPCOM origins except Atomic sites.
 *
 * @param origin
 * @returns
 */
export function isAllowedOrigin( origin: string ) {
	// sites in the allow-list and some subdomains of "calypso.live" and "wordpress.com"
	// are allowed without further check
	return (
		wpcomAllowedOrigins.includes( origin ) ||
		origin.match( /^https:\/\/[a-z0-9-]+\.calypso\.live$/ ) ||
		origin.match( /^https:\/\/([a-z0-9-]+\.)+wordpress\.com$/ )
	);
}

export function shouldTargetWpcom( isSimpleSite: boolean ) {
	return isSimpleSite || isAllowedOrigin( window.location.origin );
}

export function shouldLoadInlineHelp( sectionName: string, currentRoute: string ) {
	if ( isWpMobileApp() ) {
		return false;
	}

	const exemptedSections = [ 'jetpack-connect', 'happychat', 'devdocs', 'help', 'home' ];
	const exemptedRoutes = [ '/log-in/jetpack' ];
	const exemptedRoutesStartingWith = [
		'/start/p2',
		'/start/setup-site',
		'/plugins/domain',
		'/plugins/marketplace/setup',
	];

	return (
		! exemptedSections.includes( sectionName ) &&
		! exemptedRoutes.includes( currentRoute ) &&
		! exemptedRoutesStartingWith.some( ( startsWithString ) =>
			currentRoute.startsWith( startsWithString )
		)
	);
}
