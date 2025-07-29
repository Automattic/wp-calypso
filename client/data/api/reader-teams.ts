import wpcom from 'calypso/lib/wp';

export interface ReaderTeam {
	slug: string;
	title: string;
}

export async function fetchReaderTeams(): Promise< { number: number; teams: ReaderTeam[] } > {
	return wpcom.req.get( {
		path: '/read/teams',
		apiVersion: '1.2',
	} );
}
