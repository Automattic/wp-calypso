import { useNavigator } from '@wordpress/components';
import { useEffect, useRef } from 'react';

/**
 * Maps the route pathname to a Navigator screen.
 */
export function getScreenPath( pathname: string ): string {
	if ( pathname.startsWith( '/sites/' ) ) {
		return '/sites/' + pathname.split( '/' )[ 2 ];
	}
	if ( pathname.startsWith( '/domains/' ) ) {
		return '/domains/' + pathname.split( '/' )[ 2 ];
	}
	if ( pathname.startsWith( '/me' ) ) {
		return '/me';
	}
	return '/';
}

/**
 * Keeps Navigator screen in sync with the route pathname.
 */
export function NavigatorRouteSync( { screenPath }: { screenPath: string } ) {
	const { goTo } = useNavigator();
	const previousPathRef = useRef( screenPath );

	useEffect( () => {
		if ( screenPath !== previousPathRef.current ) {
			const isBack = screenPath === '/' && previousPathRef.current !== '/';
			goTo( screenPath, { isBack } );
			previousPathRef.current = screenPath;
		}
	}, [ screenPath, goTo ] );

	return null;
}
