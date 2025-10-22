import { createRootRouteWithContext } from '@tanstack/react-router';
import Root from '../root';
import type { AuthContextType } from '../auth';
import type { AppConfig } from '../context';

type RootRouterContext = {
	auth: AuthContextType;
	config: AppConfig;
};

export const rootRoute = createRootRouteWithContext< RootRouterContext >()( { component: Root } );
