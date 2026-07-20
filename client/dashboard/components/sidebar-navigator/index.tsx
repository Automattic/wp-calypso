import { useRouterState } from '@tanstack/react-router';
import { usePrevious } from '@wordpress/compose';
import { Children, forwardRef, isValidElement, useMemo } from 'react';
import { SidebarNavigatorContext } from './context';
import SidebarNavigatorScreen from './sidebar-navigator-screen';
import type { ScreenProps } from './sidebar-navigator-screen';
import type { ForwardedRef, ReactElement } from 'react';

interface SidebarNavigatorProps {
	children: React.ReactNode;
}

import './style.scss';

/**
 * Walks up the segments of a route ID to find the nearest parent screen path.
 *
 * Example: given routeId `/sites/$siteSlug` and screen paths `['/', '/sites/$siteSlug', '/me']`,
 * it tries `/sites` (no match), then `/` (match) → returns `/`.
 */
function findParentPath( routeId: string, screenPaths: string[] ): string | undefined {
	const parts = routeId.split( '/' );
	while ( parts.length > 1 ) {
		parts.pop();
		const candidate = parts.join( '/' ) || '/';
		if ( screenPaths.includes( candidate ) ) {
			return candidate;
		}
	}
	return undefined;
}

/**
 * Determines the active screen by matching `Screen` children's `path` props
 * against the current TanStack Router route, and provides `activePath` and
 * `isBack` to screens via context.
 *
 * When no screen path matches a route ID directly, it walks up the deepest
 * route ID's segments to find the nearest parent screen.
 *
 * Usage:
 * ```
 * <SidebarNavigator>
 *   <SidebarNavigator.Screen path="/">
 *     <PrimaryMenu />
 *   </SidebarNavigator.Screen>
 *   <SidebarNavigator.Screen path="/sites/$siteSlug">
 *     <SiteSidebar />
 *   </SidebarNavigator.Screen>
 * </SidebarNavigator>
 * ```
 */
function UnforwardedSidebarNavigator(
	{ children }: SidebarNavigatorProps,
	ref: ForwardedRef< HTMLDivElement >
) {
	const allMatches = useRouterState( { select: ( s ) => s.matches } );

	// Ignore unresolved matches so a not-found route falls back to the primary
	// menu instead of that route's dataless sidebar screen.
	const matches = allMatches.filter( ( m ) => m.status !== 'notFound' && m.status !== 'error' );

	const screens = Children.toArray( children ).filter(
		( child ): child is ReactElement< ScreenProps > =>
			isValidElement( child ) && child.type === SidebarNavigatorScreen
	);

	const screenPaths = screens.map( ( s ) => s.props.path );

	// Find the active path: exact match, then nearest parent, then the root screen.
	const routeId = matches[ matches.length - 1 ]?.routeId;
	const activePath =
		screenPaths.find( ( sp ) => matches.some( ( m ) => m.routeId === sp ) ) ??
		findParentPath( routeId, screenPaths ) ??
		screenPaths[ 0 ];

	const previousPath = usePrevious( activePath );
	const isBack =
		previousPath !== undefined &&
		activePath !== previousPath &&
		activePath === findParentPath( previousPath, screenPaths );

	const contextValue = useMemo( () => ( { activePath, isBack } ), [ activePath, isBack ] );

	return (
		<SidebarNavigatorContext.Provider value={ contextValue }>
			<div ref={ ref } className="dashboard-sidebar-navigator">
				{ children }
			</div>
		</SidebarNavigatorContext.Provider>
	);
}

const SidebarNavigator = Object.assign( forwardRef( UnforwardedSidebarNavigator ), {
	Screen: SidebarNavigatorScreen,
} );

export default SidebarNavigator;
