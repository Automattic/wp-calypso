import calypsoConfig from '@automattic/calypso-config';
import { captureException, defaultStackParser } from '@automattic/calypso-sentry';
import { camelToSnakeCase } from '@automattic/js-utils';
import { logToLogstash } from 'calypso/lib/logstash';
import type { AnyRouter } from '@tanstack/react-router';
import type { ErrorInfo } from 'react';

export const handleOnCatch = (
	error: Error,
	errorInfo: ErrorInfo,
	router: AnyRouter,
	options: {
		severity: 'error' | 'debug';
		dashboard_backport?: boolean;
		calypso_section?: string;
	}
) => {
	const code = ( error as any ).error;
	if ( code === 'authorization_required' || code === 'reauthorization_required' ) {
		return;
	}

	const frames = defaultStackParser( errorInfo.componentStack ?? '' );
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
			frame: Array.isArray( frames ) ? frames[ frames.length - 1 ] : undefined,
			path: window.location.href,
			params: routeParams,
		},
	} );

	captureException( error, {
		tags: {
			calypso_section: options.calypso_section,
			...routeParams,
		},
	} );
};
