import { isAutomatticianQuery, queryClient } from '@automattic/api-queries';
import { createLazyRoute, createRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

export async function ensureImportLabAccess() {
	return queryClient.ensureQueryData( isAutomatticianQuery() );
}

export const importLabRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'import-lab',
	head: () => ( {
		meta: [ { title: __( 'Import Lab' ) } ],
	} ),
	beforeLoad: async ( { cause } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		if ( ! ( await ensureImportLabAccess() ) ) {
			throw redirectAsNotAllowed( { to: '/sites' } );
		}
	},
} ).lazy( () =>
	import( '../../import-lab' ).then( ( module ) =>
		createLazyRoute( 'import-lab' )( {
			component: module.default,
		} )
	)
);
