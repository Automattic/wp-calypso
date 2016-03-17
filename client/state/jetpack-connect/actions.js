/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:jetpack-connect:actions' );

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { JETPACK_CONNECT_CHECK_URL, JETPACK_CONNECT_CHECK_URL_RECEIVE } from 'state/action-types';

/**
 *  Local variables;
 */
let _fetching = {};
const authURL = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true';
const installURL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=jetpack';

export default {
	checkUrl( url ) {
		return ( dispatch ) => {
			if ( _fetching[ url ] ) {
				return;
			}
			_fetching[ url ] = true;
			setTimeout( () => {
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL,
					url: url,
				} );
			}, 1 );
			Promise.all( [
				wpcom.undocumented().getSiteConnectInfo( url, 'exists' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isWordPress' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'hasJetpack' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isJetpackActive' ),
				wpcom.undocumented().getSiteConnectInfo( url, 'isJetpackConnected' ),
			] ).then( ( data, error ) => {
				_fetching[ url ] = null;
				debug( 'jetpack-connect state checked for url', url, error, data );
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: data ?  Object.assign.apply( Object, data ) : null,
					error: error
				} );

			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
					url: url,
					data: null,
					error: error
				} );
			} );
		}
	},
	goToRemoteAuth( url ) {
		window.location = url + authURL;
	},
	goToPluginInstall( url) {
		window.location = url + installURL;
	},
};
