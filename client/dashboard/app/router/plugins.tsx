import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

export const pluginsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'plugins',
} ).lazy( () =>
	import( '../../plugins' ).then( ( d ) =>
		createLazyRoute( 'plugins' )( {
			component: d.default,
		} )
	)
);

export const createPluginsRoutes = () => {
	return [ pluginsRoute ];
};
