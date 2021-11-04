import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export const useHelpSearchQuery = ( search, queryOptions = {} ) =>
	useQuery(
		[ 'help', search ],
		() => wpcom.req.get( '/help/search', { query: search, include_post_id: 1 } ),
		{
			enabled: !! search,
			...queryOptions,
		}
	);
