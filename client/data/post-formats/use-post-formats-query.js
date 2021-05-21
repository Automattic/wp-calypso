/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const usePostFormatsQuery = ( siteId ) =>
	useQuery( [ 'postFormats', siteId ], () =>
		wpcom.undocumented().site( siteId ).postFormatsList()
	);

export default usePostFormatsQuery;
