import calypsoConfig from '@automattic/calypso-config';
import { Router, createRoute, redirect } from '@tanstack/react-router';
import { logToLogstash } from 'calypso/lib/logstash';
import NotFound from '../404';
import UnknownError from '../500';
import { createDomainsRoutes } from './domains';
import { createEmailsRoutes } from './emails';
import { createMeRoutes } from './me';
import { createPluginsRoutes } from './plugins';
import { rootRoute } from './root';
import { createSitesRoutes } from './sites';
import type { AppConfig } from '../context';
import type { ErrorInfo } from 'react';

interface RouteContext {
	config?: AppConfig;
}

const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: ( { context }: { context: RouteContext } ) => {
		if ( context.config ) {
			throw redirect( { to: context.config.mainRoute } );
		}
	},
} );

const createRouteTree = ( config: AppConfig ) => {
	const children = [];

	children.push( indexRoute );

	if ( config.supports.sites ) {
		children.push( ...createSitesRoutes( config ) );
	}

	if ( config.supports.plugins ) {
		children.push( ...createPluginsRoutes() );
	}

	if ( config.supports.domains ) {
		children.push( ...createDomainsRoutes() );
	}

	if ( config.supports.emails ) {
		children.push( ...createEmailsRoutes() );
	}

	if ( config.supports.me ) {
		children.push( ...createMeRoutes( config ) );
	}

	return rootRoute.addChildren( children );
};

export const getRouter = ( config: AppConfig ) => {
	const routeTree = createRouteTree( config );
	return new Router( {
		routeTree,
		basepath: config.basePath,
		context: {
			config,
		},
		defaultErrorComponent: UnknownError,
		defaultNotFoundComponent: NotFound,
		defaultOnCatch: ( error: Error, errorInfo: ErrorInfo ) => {
			logToLogstash( {
				feature: 'calypso_client',
				message: error.message,
				severity: calypsoConfig( 'env_id' ) === 'production' ? 'error' : 'debug',
				tags: [ 'dashboard' ],
				properties: {
					dashboard_backport: false,
					env: calypsoConfig( 'env_id' ),
					message: error.message,
					stack: errorInfo.componentStack,
				},
			} );
		},
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		// Calling document.startViewTransition() ourselves is really tricky,
		// Tanstack Router knows how to do it best. Even though it says
		// "default", we can still customize it in CSS and add more transition
		// areas.
		defaultViewTransition: true,
		scrollRestoration: true,
	} );
};
