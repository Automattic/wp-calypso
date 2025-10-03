import { emailsQuery, queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { rootRoute } from './root';

export const emailsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Emails' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails',
	loader: () =>
		Promise.all( [
			queryClient.ensureQueryData( emailsQuery() ),
			queryClient.ensureQueryData( rawUserPreferencesQuery() ),
		] ),
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
