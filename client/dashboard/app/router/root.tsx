import { createRootRouteWithContext } from '@tanstack/react-router';
import Root from '../root';
import type { AuthContextType } from '../auth';
import type { AppConfig } from '../context';

export type RootRouterContext = {
	auth: AuthContextType | undefined;
	config: AppConfig;
};

export const rootRoute = createRootRouteWithContext< RootRouterContext >()( { component: Root } );
