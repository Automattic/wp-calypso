import { readTeamsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';

export const useBlogStickersQuery = ( blogId, queryOptions = {} ) => {
	const { data: teamsData } = useQuery( readTeamsQuery() );
	const teams = teamsData?.teams ?? [];
	const isAutomattician = isAutomatticTeamMember( teams );

	const stickersQuery = useQuery( {
		queryKey: [ 'blog-stickers', blogId ],
		queryFn: () => wp.req.get( `/sites/${ blogId }/blog-stickers` ),
		...queryOptions,
		enabled: !! blogId && isAutomattician,
		staleTime: 1000 * 60 * 5,
	} );

	return { ...stickersQuery, teams, isAutomattician };
};
