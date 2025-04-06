import {
	Router,
	createRoute,
	createRootRoute,
	ErrorComponent,
	Outlet,
} from '@tanstack/react-router';
import NotFound from '../404';
import { fetchSites } from '../data';
import { queryClient } from '../layout/query-client';
import Sites from '../sites';
import type { Site } from '../data/types';

const A4ALayout = () => {
	return (
		<div className="dashboard__layout">
			<main className="dashboard__content">
				<Outlet />
			</main>
		</div>
	);
};

const rootRoute = createRootRoute( {
	component: A4ALayout,
	notFoundComponent: NotFound,
} );

const indexRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	component: Sites,
	loader: () =>
		queryClient.ensureQueryData( {
			queryKey: [ 'sites' ],
			queryFn: fetchSites,
		} ) as Promise< Site[] >,
} );

const routeTree = rootRoute.addChildren( [ indexRoute ] );

export const router = new Router( {
	routeTree,
	basepath: '/v2-a4a',
	defaultErrorComponent: ( { error } ) => <ErrorComponent error={ error as Error } />,
} );

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
