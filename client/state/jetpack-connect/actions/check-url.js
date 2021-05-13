/**
 * External dependencies
 */
import debugFactory from 'debug';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
} from 'calypso/state/jetpack-connect/action-types';

import 'calypso/state/jetpack-connect/init';

/**
 * Module constants
 */
const _fetching = {};
const debug = debugFactory( 'calypso:jetpack-connect:actions' );

export function checkUrl( url, isUrlOnSites, allowWPCOMSite ) {
	return ( dispatch ) => {
		if ( _fetching[ url ] ) {
			return;
		}
		if ( isUrlOnSites ) {
			dispatch( {
				type: JETPACK_CONNECT_CHECK_URL,
				url: url,
			} );
			setTimeout( () => {
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: {
						exists: true,
						isWordPress: true,
						hasJetpack: true,
						isJetpackActive: true,
						isJetpackConnected: true,
						isWordPressDotCom: false,
						userOwnsSite: true,
					},
					error: null,
				} );
			} );
			return;
		}
		_fetching[ url ] = true;
		setTimeout( () => {
			dispatch( {
				type: JETPACK_CONNECT_CHECK_URL,
				url: url,
			} );
		}, 1 );
		wpcom
			.undocumented()
			.getSiteConnectInfo( url )
			.then( ( data ) => {
				_fetching[ url ] = null;
				debug( 'jetpack-connect state checked for url', url, data );
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: data,
					error: null,
				} );

				let errorCode = null;
				let instructionsType = null;
				let isSearch = true;
				if ( allowWPCOMSite ) {
					isSearch = false;
				}
				if ( data && data.isWordPressDotCom && isSearch ) {
					errorCode = 'calypso_jpc_error_wpdotcomsite';
				} else if ( data && ! data.exists ) {
					errorCode = 'calypso_jpc_error_notexists';
				} else if ( data && ! data.isWordPress ) {
					errorCode = 'calypso_jpc_error_notwpsite';
				} else if ( data && ! data.hasJetpack ) {
					errorCode = 'calypso_jpc_instructions_view';
					instructionsType = 'not_jetpack';
				} else if ( data && ! data.isJetpackActive ) {
					errorCode = 'calypso_jpc_instructions_view';
					instructionsType = 'inactive_jetpack';
				}

				if ( errorCode ) {
					dispatch(
						recordTracksEvent( errorCode, {
							url: url,
							type: instructionsType,
						} )
					);
				}
			} )
			.catch( ( error ) => {
				_fetching[ url ] = null;
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: null,
					error: pick( error, [ 'error', 'status', 'message' ] ),
				} );
				dispatch(
					recordTracksEvent( 'calypso_jpc_error_other', {
						url: url,
					} )
				);
			} );
	};
}
