import { isEnabled } from '@automattic/calypso-config';
import { notFound } from '@tanstack/react-router';
import { useAppContext, type AppConfig, type AppName } from '../context';
import type { ComponentType } from 'react';

// Helpers for route files in `client/dashboard/routes/`. See
// docs/file-based-routing.md (decisions 3 and 4).

type Variants< T > = { dotcom: T } & Partial< Record< Exclude< AppName, 'dotcom' >, T > >;

function pick< T >( variants: Variants< T >, app: AppName ): T {
	return variants[ app ] ?? variants.dotcom;
}

/**
 * Runs the variant for the current dashboard app. CIAB falls back to dotcom.
 */
export function perApp< TReturn >( config: AppConfig, variants: Variants< () => TReturn > ) {
	return pick( variants, config.app )();
}

/**
 * Renders the component variant for the current dashboard app. CIAB falls back to dotcom.
 * Assign the result to a module-level constant and pass that as the route's `component`.
 */
export function perAppComponent( variants: Variants< ComponentType > ) {
	return function PerAppComponent() {
		const Component = pick( variants, useAppContext().app );
		return <Component />;
	};
}

/**
 * Hides a route, and its children, in apps that don't support it.
 */
export function requireSupport( config: AppConfig, key: keyof AppConfig[ 'supports' ] ) {
	if ( ! config.supports[ key ] ) {
		throw notFound();
	}
}

/**
 * Hides a route, and its children, while a feature flag is off.
 */
export function requireFeature( flag: string ) {
	if ( ! isEnabled( flag ) ) {
		throw notFound();
	}
}
