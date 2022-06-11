import apiFetch from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';
import { createActions } from './actions';
import type { WpcomClientCredentials } from '../shared-types';
import type { CurrentUser, Dispatch, WpOrgUser } from './types';

declare global {
	interface Window {
		currentUser?: CurrentUser;
	}
}

function wporgUserToWpcomUser( user: WpOrgUser ): CurrentUser {
	return { ID: user.id, display_name: user.name, username: user.slug };
}

const isSimpleSite = window.location.host.endsWith( 'wordpress.com' );

export function createResolvers( clientCreds: WpcomClientCredentials ) {
	const { receiveCurrentUser, receiveCurrentUserFailed } = createActions( clientCreds );

	return {
		getCurrentUser: () =>
			async function getCurrentUser( { dispatch }: Dispatch ) {
				// In environments where `wpcom-user-bootstrap` is set to true, the currentUser
				// object will be server-side rendered to window.currentUser. In these cases,
				// return that object instead of performing another API request to `/me`.
				if ( window.currentUser ) {
					return receiveCurrentUser( window.currentUser );
				}

				// in Atomic wp-admin sites, use apiFetch instead of wpcom-proxy-fetch because it doesn't work there.
				// this doesn't return the exact same results, but it solves many problems.
				if ( ! isSimpleSite ) {
					const user: WpOrgUser = await apiFetch( { path: '/wp/v2/users/me' } );
					return dispatch( receiveCurrentUser( wporgUserToWpcomUser( user ) ) );
				}

				try {
					const currentUser: CurrentUser = await wpcomRequest( {
						path: '/me',
						apiVersion: '1.1',
					} );
					return dispatch( receiveCurrentUser( currentUser ) );
				} catch ( err ) {
					return dispatch( receiveCurrentUserFailed() );
				}
			},
	};
}
