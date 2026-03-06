import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { isValidId } from '../helpers';
import type { FeedItem } from '../types';

const useReadFeedQuery = ( enabled: boolean, feedId?: number | string ) => {
	return useQuery( {
		queryKey: [ 'read', 'feeds', Number( feedId ) ],
		queryFn: async () => {
			return wpcomRequest< FeedItem >( {
				path: `/read/feed/${ feedId }`,
				apiVersion: '1.1',
				method: 'GET',
			} );
		},
		enabled: enabled && isValidId( feedId ),
	} );
};

export default useReadFeedQuery;
