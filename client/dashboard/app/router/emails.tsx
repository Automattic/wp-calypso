import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { emailsQuery } from '../queries/emails';
import { queryClient } from '../query-client';
import { rootRoute } from './root';

export const emailsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'emails',
	loader: () => queryClient.ensureQueryData( emailsQuery() ),
} ).lazy( () =>
	import( '../../emails' ).then( ( d ) =>
		createLazyRoute( 'emails' )( {
			component: d.default,
		} )
	)
);

export const createEmailsRoutes = () => {
	return [ emailsRoute ];
};
