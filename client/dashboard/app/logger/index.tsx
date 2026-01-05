import { DashboardDataError, INACCESSIBLE_JETPACK_ERROR_CODE } from '@automattic/api-core';
import calypsoConfig from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { camelToSnakeCase } from '@automattic/js-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import type { AnyRouter } from '@tanstack/react-router';
import type { ErrorInfo } from 'react';

function isBenignError( error: Error ) {
	// Ignore errors related to missing auth tokens.
	// The user will get redirected to the login page / second auth factor.
	switch ( error.name ) {
		case 'AuthorizationRequiredError':
		case 'ReauthorizationRequiredError':
			return true;
	}

	// Ignore errors related to inaccessible Jetpack sites.
	// The user is expected to debug their Jetpack sites.
	if ( error instanceof DashboardDataError ) {
		return error.code === INACCESSIBLE_JETPACK_ERROR_CODE;
	}

	// Ignore errors related to view transitions.
	// Those are triggered by the browser when the user tries to navigate away from a page that is still transitioning.
	if ( error instanceof DOMException ) {
		switch ( error.name ) {
			case 'AbortError':
			case 'InvalidStateError':
				return error.stack?.includes( 'startViewTransition' );
		}
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

	logToLogstash( {
		feature: 'calypso_client',
		message: error.message,
		severity: options.severity,
		tags: [ 'dashboard' ],
		properties: {
			dashboard_backport: options.dashboard_backport,
			env: calypsoConfig( 'env_id' ),
			message: error.message,
			stack: errorInfo.componentStack,
			path: window.location.href,
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
		} );
	}
}
