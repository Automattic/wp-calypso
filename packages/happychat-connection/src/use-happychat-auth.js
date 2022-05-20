import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'i18n-calypso';
import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

export default function useHappychatAuth() {
	return useQuery(
		'getHappychatAuth',
		async () => {
			const user = await wpcomRequest( {
				path: '/me',
				apiVersion: '1.1',
			} );

			const url = config( 'happychat_url' );
			const locale = getLocaleSlug();

			const happychatUser = {
				signer_user_id: user.ID,
				locale,
				groups: [ 'WP.com' ],
				skills: {
					product: [ 'WP.com' ],
				},
			};
			const session = await wpcomRequest( {
				path: '/happychat/session',
				apiVersion: '1.1',
				method: 'POST',
			} );
			const { session_id, geo_location } = session;
			happychatUser.geoLocation = geo_location;

			const sign = await wpcomRequest( {
				path: '/jwt/sign',
				apiVersion: '1.1',
				method: 'POST',
				body: { payload: JSON.stringify( { user, session_id } ) },
			} );

			const { jwt } = sign;

			return { url, user: { jwt, ...happychatUser } };
		},
		{
			refetchOnWindowFocus: false,
			keepPreviousData: true,
		}
	);
}
