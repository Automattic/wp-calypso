import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { HappychatSession, HappychatUser, User, HappychatAuth, Jwt } from './types';

export async function requestHappyChatAuth() {
	const user: User = await wpcomRequest( {
		path: '/me',
		apiVersion: '1.1',
	} );

	/**
	 * The /happychat/session endpoint returns the right env (staging vs production) based on whether the user is proxied.
	 *
	 * @returns url The happychat endpoint URL based on if the connection is proxied (formerly happychat_url)
	 * @returns session_id
	 * @returns geo_location
	 */
	const { url, session_id, geo_location }: HappychatSession = await wpcomRequest( {
		path: '/happychat/session',
		apiVersion: '1.1',
		method: 'POST',
	} );

	const happychatUser: HappychatUser = {
		signer_user_id: user.ID,
		groups: [ 'WP.com' ],
		geoLocation: geo_location,
		skills: {
			product: [ 'WP.com' ],
			language: [ user.language ],
		},
	};

	/**
	 * The /jwt/sign is used to sign JSON Web Token
	 *
	 * @returns {string} jwt JSON Web Token of signed payload
	 */
	const { jwt }: Jwt = await wpcomRequest( {
		path: '/jwt/sign',
		apiVersion: '1.1',
		method: 'POST',
		body: { payload: JSON.stringify( { user, session_id } ) },
	} );

	return { url, user: { jwt, ...happychatUser }, fullUser: user };
}

export default function useHappychatAuth( enabled = true ) {
	return useQuery< HappychatAuth >( 'getHappychatAuth', requestHappyChatAuth, {
		staleTime: 10 * 60 * 1000, // 10 minutes
		enabled,
	} );
}
