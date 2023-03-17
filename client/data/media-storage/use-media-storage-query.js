import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

// Those values have been copied from WPCOM default-constants.
export const KB_IN_BYTES = 1024;
export const MB_IN_BYTES = 1024 * KB_IN_BYTES;
export const GB_IN_BYTES = 1024 * MB_IN_BYTES;
export const TB_IN_BYTES = 1024 * GB_IN_BYTES;
export const PB_IN_BYTES = 1024 * TB_IN_BYTES;
export const EB_IN_BYTES = 1024 * PB_IN_BYTES;
export const ZB_IN_BYTES = 1024 * EB_IN_BYTES;
export const YB_IN_BYTES = 1024 * ZB_IN_BYTES;

function useMediaStorageQuery( siteId, queryOptions = {} ) {
	return useQuery(
		[ 'media-storage', siteId ],
		() => wp.req.get( `/sites/${ siteId }/media-storage` ),
		{
			...queryOptions,
			enabled: !! siteId,
		}
	);
}

export default useMediaStorageQuery;
