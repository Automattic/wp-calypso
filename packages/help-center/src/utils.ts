/* eslint-disable no-restricted-imports */
import { isWpMobileApp } from 'calypso/lib/mobile-app';

// function that tells us if we want to show the Help Center to the user, given that we're showing it to
// only a certain percentage of users.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function shouldShowHelpCenterToUser( _userId: number ) {
	return true;
}

export function shouldLoadInlineHelp( sectionName: string, currentRoute: string ) {
	if ( isWpMobileApp() ) {
		return false;
	}

	const exemptedSections = [ 'jetpack-connect', 'happychat', 'devdocs', 'help', 'home' ];
	const exemptedRoutes = [ '/log-in/jetpack' ];
	const exemptedRoutesStartingWith = [
		'/start/p2',
		'/start/videopress',
		'/start/setup-site',
		'/start/newsletter',
		'/start/site-content-collection',
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
