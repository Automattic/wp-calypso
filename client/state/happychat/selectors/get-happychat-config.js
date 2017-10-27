/** @format */

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import { getGroups } from 'state/happychat/selectors';
import { getCurrentUser, getCurrentUserLocale } from 'state/current-user/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';

// Promise based interface for wpcom.request
const request = ( ...args ) =>
	new Promise( ( resolve, reject ) => {
		wpcom.request( ...args, ( error, response ) => {
			if ( error ) {
				return reject( error );
			}
			resolve( response );
		} );
	} );

const sign = payload =>
	request( {
		method: 'POST',
		path: '/jwt/sign',
		body: { payload: JSON.stringify( payload ) },
	} );

const startSession = () =>
	request( {
		method: 'POST',
		path: '/happychat/session',
	} );

export default state => () => {
	const url = config( 'happychat_url' );

	const locale = getCurrentUserLocale( state );

	let groups = getGroups( state );
	const selectedSite = getHelpSelectedSite( state );
	if ( selectedSite && selectedSite.ID ) {
		groups = getGroups( state, selectedSite.ID );
	}

	const user = getCurrentUser( state );

	const happychatUser = {
		signer_user_id: user.ID,
		locale,
		groups,
	};

	return startSession()
		.then( ( { session_id, geo_location } ) => {
			happychatUser.geoLocation = geo_location;
			return sign( { user, session_id } );
		} )
		.then( ( { jwt } ) => ( { url, user: { jwt, ...happychatUser } } ) );
};
