import { wpcom } from '../wpcom-fetcher';
import type { ReadFourForFourCandidatesResponse, ReadFourForFourStatusResponse } from './types';

/**
 * Sites other new writers can subscribe to as part of the 4 for 4 program,
 * from the wpcom/v2 `GET /read/four-for-four/candidates` endpoint. The server
 * already excludes the current user's own sites and sites they follow, and
 * orders program participants first.
 */
export const fetchReadFourForFourCandidates = (): Promise< ReadFourForFourCandidatesResponse > =>
	wpcom.req.get( {
		path: '/read/four-for-four/candidates',
		apiNamespace: 'wpcom/v2',
	} );

/**
 * The current user's 4 for 4 state from `GET /read/four-for-four/status`.
 */
export const fetchReadFourForFourStatus = (): Promise< ReadFourForFourStatusResponse > =>
	wpcom.req.get( {
		path: '/read/four-for-four/status',
		apiNamespace: 'wpcom/v2',
	} );
