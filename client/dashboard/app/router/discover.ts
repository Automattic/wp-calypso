import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { rootRoute } from './root';

export const discoverRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Discover' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'discover',
} ).lazy( () =>
	import( '../../discover' ).then( ( d ) =>
		createLazyRoute( 'discover' )( {
			component: d.default,
		} )
	)
);

export const createDiscoverRoutes = () => {
	return [ discoverRoute ];
};
