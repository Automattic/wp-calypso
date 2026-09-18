import { queryOptions } from '@tanstack/react-query';
import { readTeamsQuery } from './read-teams';

export const isAutomatticianQuery = () =>
	queryOptions( {
		...readTeamsQuery(),
		select: ( data ) => data.teams.some( ( team ) => team.slug === 'a8c' ),
	} );
