import { readTeamsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';

export const useBlogStickersQuery = ( blogId, queryOptions = {} ) => {
	const { data } = useQuery( readTeamsQuery() );
	const isAutomattician = isAutomatticTeamMember( data?.teams ?? [] );

	return useQuery( {
		queryKey: [ 'blog-stickers', blogId ],
		queryFn: () => wp.req.get( `/sites/${ blogId }/blog-stickers` ),
		...queryOptions,
		enabled: !! blogId && isAutomattician,
		staleTime: 1000 * 60 * 5,
	} );
};
