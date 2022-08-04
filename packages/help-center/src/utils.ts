/* eslint-disable no-restricted-imports */
import { isWpMobileApp } from 'calypso/lib/mobile-app';

// function that tells us if we want to show the Help Center to the user, given that we're showing it to
// only a certain percentage of users.
export function shouldShowHelpCenterToUser( userId: number ) {
	const currentSegment = 30; //percentage of users that will see the Help Center, not the FAB
	const userSegment = userId % 100;
	return userSegment < currentSegment;
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
