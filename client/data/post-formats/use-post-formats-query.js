import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const usePostFormatsQuery = ( siteId ) =>
	useQuery( {
		queryKey: [ 'postFormats', siteId ],
		queryFn: () => wpcom.req.get( `/sites/${ siteId }/post-formats` ),
	} );

export default usePostFormatsQuery;
