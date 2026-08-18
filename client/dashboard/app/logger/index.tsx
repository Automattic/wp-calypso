import { isInaccessibleJetpackError } from '@automattic/api-core';
import calypsoConfig from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { camelToSnakeCase } from '@automattic/js-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import { maybeReloadForChunkError } from '../chunk-load-recovery';
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
	// A failed chunk load is usually a stale deploy, not a real error. Reload
	// once to fetch fresh chunks instead of logging and showing an error page.
	if ( maybeReloadForChunkError( error ) ) {
		return;
	}

	if ( isBenignError( error ) ) {
		return;
	}

	const lastMatch = router.state.matches[ router.state.matches.length - 1 ];
	const routeParams = Object.fromEntries(
		Object.entries( lastMatch.params ?? {} ).map( ( [ key, value ] ) => [
			camelToSnakeCase( key ),
			value,
		] )
	);

	const previousPath = previousPaths.get( router );

	logToLogstash( {
		feature: 'calypso_client',
		message: error.message,
		severity: options.severity,
		tags: [ 'dashboard' ],
		properties: {
			dashboard_backport: options.dashboard_backport,
			env_id: calypsoConfig( 'env_id' ),
			message: error.message,
			stack: errorInfo.componentStack,
			path: window.location.href,
			previous_path: previousPath,
			params: routeParams,
		},
	} );

	// Dashboard backport has its mechanism to send error log to sentry.
	if ( ! options.dashboard_backport ) {
		captureException( error, {
			tags: {
				calypso_section: options.calypso_section,
				...routeParams,
			},
			extra: { previous_path: previousPath },
		} );
	}
}
