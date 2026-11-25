import config from '@automattic/calypso-config';
import { useLayoutEffect, type ReactNode } from 'react';
import isSectionEnabled from 'calypso/sections-filter';
import { getSections } from 'calypso/sections-helper';
import { pathToRegExp } from 'calypso/utils';
import { completeNavigation, startNavigation } from './module';
import type { Context } from '@automattic/calypso-router';

interface SectionDefinition {
	name: string;
	paths: string[];
	envId?: string[];
}

const UNKNOWN_ROUTE_NAME = 'unknown';

// Navigation key for the latest navigation.
let currentNavigationKey: object | undefined;

// The pathname and query of the latest navigation.
let lastRoutePath: string | undefined;

// Whether a route has been committed to the DOM yet.
let hasCommittedRoute = false;

// Determine how to name a route, based on path matching.
function getRouteName( pathname: string ) {
	const decodedPathname = decodeURIComponent( pathname );
	const sections: SectionDefinition[] = getSections();
	const section = sections.find(
		( candidate ) =>
			isSectionEnabled( candidate ) &&
			( ! candidate.envId || candidate.envId.includes( config( 'env_id' ) ) ) &&
			candidate.paths.some( ( path ) => {
				const pattern = pathToRegExp( path );
				return typeof pattern === 'string'
					? decodedPathname === pattern
					: pattern.test( decodedPathname );
			} )
	);

	return section?.name ?? UNKNOWN_ROUTE_NAME;
}

/**
 * Route middleware that signals the start of a navigation. It has to run before the route
 * handlers, so that the time they take is part of the navigation.
 */
export function trackNavigationStart( context: Context, next: () => void ) {
	const { pathname, search } = new URL( context.canonicalPath, window.location.origin );
	const routePath = pathname + search;
	const isSamePath = routePath === lastRoutePath;
	lastRoutePath = routePath;

	// The page load is measured on its own. A dispatch of the path that's already showing is a
	// refresh or a change of hash, and keeps the key of the navigation that led there.
	if ( hasCommittedRoute && ! context.init && ! isSamePath ) {
		currentNavigationKey = {};
		startNavigation( getRouteName( pathname ), routePath, currentNavigationKey );
	}

	context.bilmurNavigationKey = currentNavigationKey;
	next();
}

/**
 * Signals that a route is in the DOM, which completes the navigation that led to it (if any).
 */
export function trackNavigationComplete( navigationKey: object | undefined ) {
	hasCommittedRoute = true;

	if ( navigationKey ) {
		completeNavigation( navigationKey );
	}
}

function NavigationComplete( { navigationKey }: { navigationKey: object | undefined } ) {
	useLayoutEffect( () => {
		trackNavigationComplete( navigationKey );
	}, [ navigationKey ] );

	return null;
}

/**
 * Wraps a route's layout so that committing it to the DOM completes its navigation.
 * Falls back to the unmodified layout if `bilmur-spa` is disabled.
 */
export function withNavigationComplete( layout: ReactNode, navigationKey: object | undefined ) {
	if ( ! config.isEnabled( 'bilmur-spa' ) ) {
		return layout;
	}

	return (
		<>
			{ layout }
			<NavigationComplete navigationKey={ navigationKey } />
		</>
	);
}
