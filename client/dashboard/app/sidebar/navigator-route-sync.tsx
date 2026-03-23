import { useNavigator } from '@wordpress/components';
import { useEffect, useRef } from 'react';

/**
 * Maps the route pathname to a Navigator screen.
 *
 * When `hasError` is true the screen falls back to the parent.
 */
export function getScreenPath( pathname: string, hasError = false ): string {
	if ( pathname.startsWith( '/sites/' ) ) {
		const siteSlug = pathname.split( '/' )[ 2 ];
		if ( ! siteSlug || hasError ) {
			return '/';
		}
		return '/sites/' + siteSlug;
	}
	if ( pathname.startsWith( '/domains/' ) ) {
		const domainSlug = pathname.split( '/' )[ 2 ];
		if ( ! domainSlug || hasError ) {
			return '/';
		}
		return '/domains/' + domainSlug;
	}
	if ( pathname.startsWith( '/me' ) ) {
		return hasError ? '/' : '/me';
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
