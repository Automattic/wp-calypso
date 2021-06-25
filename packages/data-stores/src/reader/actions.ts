export interface ReaderTeam {
	slug: string;
	team: string;
}

export interface ReaderTeamsResponse {
	number: number;
	teams: ReaderTeam[];
}

export const fetchReaderTeamsSuccess = ( response: ReaderTeamsResponse ) =>
	( {
		type: 'FETCH_READER_TEAMS_SUCCESS',
		response,
	} as const );

export type ReaderAction =
	| ReturnType< typeof fetchReaderTeamsSuccess >
	// Dummy action used during testing
	| { type: 'DUMMY_ACTION' };
