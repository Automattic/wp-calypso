import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { isValidId } from '../helpers';

export type ReadFeedResponse = {
	URL: string;
	blog_ID: string;
	description: string;
	feed_ID: string;
	feed_URL: string;
	image: string;
	is_following: boolean;
	last_checked: string;
	last_update: string;
	marked_for_refresh: boolean;
	meta: {
		links: {
			self: string;
			[ key: string ]: string;
		};
	};
	name: string;
	next_refresh_time: string | null;
	organization_id: number;
	subscribers_count: number;
	unseen_count: number;
};

const useReadFeedQuery = ( feedId?: number | string ) => {
	return useQuery( {
		queryKey: [ 'read', 'feeds', Number( feedId ) ],
		queryFn: async () => {
			return wpcomRequest< ReadFeedResponse >( {
				path: `/read/feed/${ feedId }`,
				apiVersion: '1.1',
				method: 'GET',
			} );
		},
		enabled: isValidId( feedId ),
	} );
};

export default useReadFeedQuery;
