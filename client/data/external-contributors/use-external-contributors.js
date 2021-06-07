/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const useExternalContributors = ( siteId, queryOptions = {} ) => {
	return useQuery(
		[ 'external-contributors', siteId ],
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/external-contributors`,
				apiNamespace: 'wpcom/v2',
			} ),
		queryOptions
	);
};

export default useExternalContributors;
