import { queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { readTeamsQuery } from './read-teams';
import type { fetchReaderTeams } from '@automattic/api-core';

type ReaderTeams = Awaited< ReturnType< typeof fetchReaderTeams > >;

const isAutomatticianTeams = ( data: ReaderTeams ) =>
	data.teams.some( ( team ) => team.slug === 'a8c' );

export const isAutomatticianQuery = () =>
	queryOptions( {
		...readTeamsQuery(),
		select: isAutomatticianTeams,
	} );

/**
 * Resolves whether the current user is an Automattician, for code outside React such as a
 * route's `beforeLoad`. `queryClient.ensureQueryData( isAutomatticianQuery() )` can't be used for
 * this: it resolves to the cached teams response without applying `select`, which is always truthy.
 */
export async function fetchIsAutomattician(): Promise< boolean > {
	return isAutomatticianTeams( await queryClient.ensureQueryData( readTeamsQuery() ) );
}
