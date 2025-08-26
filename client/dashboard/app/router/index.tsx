import { Router, createRoute, redirect } from '@tanstack/react-router';
import NotFound from '../404';
import UnknownError from '../500';
import { createDomainsRoutes } from './domains';
import { createEmailsRoutes } from './emails';
import { createMeRoutes } from './me';
import { createOverviewRoutes } from './overview';
import { rootRoute } from './root';
import { createSitesRoutes } from './sites';
import type { AppConfig } from '../context';

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

	if ( config.supports.overview ) {
		children.push( ...createOverviewRoutes() );
	}

	if ( config.supports.sites ) {
		children.push( ...createSitesRoutes( config ) );
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
		defaultErrorComponent: UnknownError,
		defaultNotFoundComponent: NotFound,
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
