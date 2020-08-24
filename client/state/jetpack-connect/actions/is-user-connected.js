/**
 * External dependencies
 */
import debugFactory from 'debug';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { receiveDeletedSite, receiveSite } from 'state/sites/actions';
import { withoutNotice } from 'state/notices/actions';
import { JETPACK_CONNECT_USER_ALREADY_CONNECTED } from 'state/jetpack-connect/action-types';
import { SITE_REQUEST, SITE_REQUEST_FAILURE, SITE_REQUEST_SUCCESS } from 'state/action-types';

import 'state/jetpack-connect/init';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:jetpack-connect:actions' );

export function isUserConnected( siteId, siteIsOnSitesList ) {
	let accessibleSite;
	return ( dispatch ) => {
		dispatch( {
			type: SITE_REQUEST,
			siteId,
		} );
		debug( 'checking that site is accessible', siteId );
		return wpcom
			.site( siteId )
			.get()
			.then( ( site ) => {
				accessibleSite = site;
				debug( 'site is accessible! checking that user is connected', siteId );
				return wpcom.undocumented().jetpackIsUserConnected( siteId );
			} )
			.then( () => {
				debug( 'user is connected to site.', accessibleSite );
				dispatch( {
					type: SITE_REQUEST_SUCCESS,
					siteId,
				} );
				dispatch( {
					type: JETPACK_CONNECT_USER_ALREADY_CONNECTED,
				} );
				if ( ! siteIsOnSitesList ) {
					debug( 'adding site to sites list' );
					dispatch( receiveSite( omit( accessibleSite, '_headers' ) ) );
				} else {
					debug( 'site is already on sites list' );
				}
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_REQUEST_FAILURE,
					siteId,
					error,
				} );
				debug( 'user is not connected from', error );
				if ( siteIsOnSitesList ) {
					debug( 'removing site from sites list', siteId );
					dispatch( withoutNotice( receiveDeletedSite )( siteId ) );
				}
			} );
	};
}
