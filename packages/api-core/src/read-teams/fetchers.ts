import { wpcom } from '../wpcom-fetcher';
import type { ReaderTeam } from './types';

export async function fetchReaderTeams(): Promise< { number: number; teams: ReaderTeam[] } > {
	return wpcom.req.get( {
		path: '/read/teams',
		apiVersion: '1.2',
	} );
}
