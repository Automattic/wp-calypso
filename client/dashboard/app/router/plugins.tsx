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

export const pluginRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'plugins/$pluginId',
} ).lazy( () =>
	import( '../../plugins/plugin' ).then( ( d ) =>
		createLazyRoute( 'plugin' )( {
			component: d.default,
		} )
	)
);

export const createPluginsRoutes = () => {
	return [ pluginsRoute, pluginRoute ];
};
