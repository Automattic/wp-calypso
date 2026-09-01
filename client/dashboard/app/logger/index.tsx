import { isInaccessibleJetpackError } from '@automattic/api-core';
import calypsoConfig from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { camelToSnakeCase } from '@automattic/js-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import { maybeReloadForChunkError } from '../chunk-load-recovery';
import { attachComponentStackAsCause } from './component-stack';
import { getDomInterferenceReport } from './dom-interference';
import type { AnyRouter } from '@tanstack/react-router';
import type { ErrorInfo } from 'react';

const previousPaths = new WeakMap< AnyRouter, string >();

// `router.state.resolvedLocation` is overwritten with the current location as
// soon as a navigation settles, so `onResolved`'s `fromLocation` is used
// instead. It is absent on the first load — a URL opened from outside the app.
export function initLogger( router: AnyRouter ) {
	return router.subscribe( 'onResolved', ( { fromLocation } ) => {
		if ( fromLocation ) {
			previousPaths.set( router, fromLocation.href );
		}
	} );
}

function isBenignError( error: Error ) {
	// Ignore errors related to missing auth tokens.
	// The user will get redirected to the login page / second auth factor.
	switch ( error.name ) {
		case 'AuthorizationRequiredError':
		case 'ReauthorizationRequiredError':
		case 'DomainPermissionError':
			return true;
	}

	// Ignore errors related to inaccessible Jetpack sites.
	// The user is expected to debug their Jetpack sites.
	if ( isInaccessibleJetpackError( error ) ) {
		return true;
	}

	return false;
}

interface ReportOptions {
	severity: 'error' | 'debug';
	dashboard_backport?: boolean;
	calypso_section?: string;
	routeParams?: Record< string, unknown >;
	previousPath?: string;
}

/**
 * Shared entry point for dashboard errors, whether caught by a router/error
 * boundary or by React's root `onUncaughtError` handler. Decides whether an
 * error is worth reporting, then delegates to `reportDashboardError`.
 */
function handleDashboardError(
	error: Error,
	componentStack: string | null | undefined,
	options: ReportOptions
) {
	// A failed chunk load is usually a stale deploy, not a real error. Reload
	// once to fetch fresh chunks instead of logging and showing an error page.
	if ( maybeReloadForChunkError( error ) ) {
		return;
	}

	if ( isBenignError( error ) ) {
		return;
	}

	reportDashboardError( error, componentStack, options );
}

/**
 * Enriches every report with a DOM-interference fingerprint and a chained,
 * symbolicable component stack.
 */
function reportDashboardError(
	error: Error,
	componentStack: string | null | undefined,
	options: ReportOptions
) {
	const domInterference = getDomInterferenceReport();

	logToLogstash( {
		feature: 'calypso_client',
		message: error.message,
		severity: options.severity,
		tags: [ 'dashboard' ],
		properties: {
			dashboard_backport: options.dashboard_backport,
			env_id: calypsoConfig( 'env_id' ),
			message: error.message,
			stack: componentStack,
			path: window.location.href,
			previous_path: options.previousPath,
			params: options.routeParams,
			...domInterference.tags,
			dom_interference: domInterference.context,
		},
	} );

	// Dashboard backport has its mechanism to send error log to sentry.
	if ( options.dashboard_backport ) {
		return;
	}

	attachComponentStackAsCause( error, componentStack );

	captureException( error, {
		tags: {
			calypso_section: options.calypso_section,
			...options.routeParams,
			...domInterference.tags,
		},
		...( options.previousPath ? { extra: { previous_path: options.previousPath } } : {} ),
		contexts: {
			'dom-interference': domInterference.context,
			...( componentStack ? { react: { componentStack } } : {} ),
		},
	} );
}

export function handleOnCatch(
	error: Error,
	errorInfo: ErrorInfo,
	router: AnyRouter,
	options: {
		severity: 'error' | 'debug';
		dashboard_backport?: boolean;
		calypso_section?: string;
	}
) {
	const lastMatch = router.state.matches[ router.state.matches.length - 1 ];
	const routeParams = Object.fromEntries(
		Object.entries( lastMatch?.params ?? {} ).map( ( [ key, value ] ) => [
			camelToSnakeCase( key ),
			value,
		] )
	);

	handleDashboardError( error, errorInfo.componentStack, {
		severity: options.severity,
		dashboard_backport: options.dashboard_backport,
		calypso_section: options.calypso_section,
		routeParams,
		previousPath: previousPaths.get( router ),
	} );
}

/**
 * Handler for React 19's root `onUncaughtError`. Captures commit-phase crashes
 * that bypass every error boundary (the `handled:no` subset in Sentry), which
 * otherwise arrive as bare `window.onerror` events with no component or route
 * context. React no longer rethrows to `window.onerror` once this is provided,
 * so this is the only reporting path for those errors.
 */
export function handleUncaughtError( error: unknown, errorInfo: { componentStack?: string } ) {
	try {
		const normalizedError = error instanceof Error ? error : new Error( String( error ) );
		handleDashboardError( normalizedError, errorInfo.componentStack, {
			severity: calypsoConfig( 'env_id' ) === 'dashboard-production' ? 'error' : 'debug',
			calypso_section: 'dashboard',
		} );
	} catch {
		// A throwing error handler would replace the original crash with a less
		// useful one. Swallow.
	}

	// Preserve React's default console reporting for uncaught errors.
	// eslint-disable-next-line no-console
	console.error( error );
}
