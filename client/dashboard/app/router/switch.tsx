import { isAutomatticianQuery, queryClient } from '@automattic/api-queries';
import { createLazyRoute, createRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

export async function ensureSwitchAccess() {
	return queryClient.ensureQueryData( isAutomatticianQuery() );
}

export const switchRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'switch',
	head: () => ( {
		meta: [ { title: __( 'Switch' ) } ],
	} ),
	beforeLoad: async ( { cause } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		if ( ! ( await ensureSwitchAccess() ) ) {
			throw redirectAsNotAllowed( { to: '/sites' } );
		}
	},
} ).lazy( () =>
	import( '../../switch' ).then( ( module ) =>
		createLazyRoute( 'switch' )( {
			component: module.default,
		} )
	)
);
