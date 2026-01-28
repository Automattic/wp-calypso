import { createRootRouteWithContext } from '@tanstack/react-router';
import Root from '../root';
import NotFoundRoot from '../root/error';
import type { AppConfig } from '../context';

export type RootRouterContext = {
	config: AppConfig;
};

export const rootRoute = createRootRouteWithContext< RootRouterContext >()( {
	component: Root,
	notFoundComponent: NotFoundRoot,
} );
