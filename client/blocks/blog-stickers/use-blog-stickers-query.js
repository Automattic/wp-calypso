import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import wp from 'calypso/lib/wp';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';

export const useBlogStickersQuery = ( blogId, queryOptions = {} ) => {
	const teams = useSelector( getReaderTeams );
	const isAutomattician = isAutomatticTeamMember( teams );

	return useQuery( {
		queryKey: [ 'blog-stickers', blogId ],
		queryFn: () => wp.req.get( `/sites/${ blogId }/blog-stickers` ),
		...queryOptions,
		enabled: !! blogId && isAutomattician,
		staleTime: 1000 * 60 * 5,
	} );
};
