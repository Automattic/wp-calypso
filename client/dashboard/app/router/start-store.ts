import { queryClient } from '@automattic/api-queries';
import { createRoute, redirect } from '@tanstack/react-router';
import { addQueryArgs } from '@wordpress/url';
import { wpcomLink } from '../../utils/link';
import { AUTH_QUERY_KEY } from '../auth';
import { rootRoute } from './root';
import type { User } from '@automattic/api-core';

export const startStoreRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/start-store',
	beforeLoad: () => {
		const user = queryClient.getQueryData< User >( AUTH_QUERY_KEY );

		if ( user && user.garden_site_count > 0 ) {
			throw redirect( { to: '/sites', replace: true } );
		}

		// The site builder flow is served by a separate entry point (stepper),
		// so we need a full page navigation rather than a TanStack redirect.
		window.location.replace(
			addQueryArgs( wpcomLink( '/setup/ai-site-builder-spec/site-spec' ), {
				source: 'ciab-sites-dashboard',
				ref: 'start-store',
			} )
		);
	},
} );
