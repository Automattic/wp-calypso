import { createRootRouteWithContext } from '@tanstack/react-router';
import Root from '../root';
import type { AppConfig } from '../context';

export type RootRouterContext = {
	config: AppConfig;
};

export const rootRoute = createRootRouteWithContext< RootRouterContext >()( { component: Root } );
