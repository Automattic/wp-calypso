import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useFollowerQuery = ( siteId, subscriberId, type ) => {
	/**
	 * Normalizes a follower object. Changes 'avatar' to 'avatar_URL' allowing a follower
	 * object to be used with the Gravatar component.
	 * @see normalizeFollower in client/data/followers/use-followers-query.js
	 */
	function normalizeFollower( follower ) {
		return {
			avatar_URL: follower.avatar,
			...follower,
		};
	}

	return useQuery( {
		queryKey: [ 'subscriber', siteId, subscriberId, type ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/followers/${ subscriberId }?type=${ type }&http_envelope=1`,
				apiNamespace: 'rest/v1.1',
			} ),
		select: normalizeFollower,
	} );
};

export default useFollowerQuery;
