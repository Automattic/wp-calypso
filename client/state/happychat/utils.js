/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import config from 'calypso/config';
import getGroups from 'calypso/state/happychat/selectors/get-groups';
import { getCurrentUser, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getHelpSelectedSite } from 'calypso/state/help/selectors';
import getSkills from 'calypso/state/happychat/selectors/get-skills';

const sign = ( payload ) => wpcom.req.post( '/jwt/sign', { payload: JSON.stringify( payload ) } );

const startSession = () => wpcom.req.post( '/happychat/session' );

export const getHappychatAuth = ( state ) => () => {
	const url = config( 'happychat_url' );

	const locale = getCurrentUserLocale( state );

	let groups = getGroups( state );
	let skills = getSkills( state );
	const selectedSite = getHelpSelectedSite( state );

	if ( selectedSite && selectedSite.ID ) {
		groups = getGroups( state, selectedSite.ID );
		skills = getSkills( state, selectedSite.ID );
	}

	const user = getCurrentUser( state );

	if ( ! user ) {
		return Promise.reject(
			'Failed to start an authenticated Happychat session: No current user found'
		);
	}

	const happychatUser = {
		signer_user_id: user.ID,
		locale,
		groups,
		skills,
	};

	return startSession()
		.then( ( { session_id, geo_location } ) => {
			happychatUser.geoLocation = geo_location;
			return sign( { user, session_id } );
		} )
		.then( ( { jwt } ) => ( { url, user: { jwt, ...happychatUser } } ) )
		.catch( ( e ) => Promise.reject( 'Failed to start an authenticated Happychat session: ' + e ) );
};
