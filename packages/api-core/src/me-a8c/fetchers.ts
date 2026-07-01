import { fetchReaderTeams } from '../read-teams';

export async function fetchIsAutomattician(): Promise< boolean > {
	const { teams } = await fetchReaderTeams();
	return teams.some( ( team ) => team.slug === 'a8c' );
}
