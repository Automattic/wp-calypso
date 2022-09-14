/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import wpcomRequest from 'wpcom-proxy-request';
import { isWpMobileApp } from 'calypso/lib/mobile-app';

// function that tells us if we want to show the Help Center to the user, given that we're showing it to
// only a certain percentage of users.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function shouldShowHelpCenterToUser( userId: number, readerTeams: any ) {
	const isA12n = async () => {
		const response: any = await wpcomRequest( {
			method: 'GET',
			path: '/read/teams',
			apiVersion: '1.2',
		} );
		console.log( 'API - ', response.teams[ 0 ].slug === 'a8c' );
	};

	console.log( 'Reader - ', readerTeams );
	isA12n();
	return false;
	/*
	const currentSegment = 30; //percentage of users that will see the Help Center, not the FAB
	const userSegment = userId % 100;
	return userSegment < currentSegment;
	*/
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
		'/start/link-in-bio',
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
