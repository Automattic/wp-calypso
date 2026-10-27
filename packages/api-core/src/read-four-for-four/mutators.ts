import { wpcom } from '../wpcom-fetcher';
import type { ReadFourForFourProgressParams, ReadFourForFourStatusResponse } from './types';

/**
 * Record the candidate sites the user has subscribed to via
 * `POST /read/four-for-four/progress`. The server unions the IDs into the
 * user's followed list and marks the program completed once it holds four.
 */
export const recordReadFourForFourProgress = (
	params: ReadFourForFourProgressParams
): Promise< ReadFourForFourStatusResponse > =>
	wpcom.req.post( { path: '/read/four-for-four/progress', apiNamespace: 'wpcom/v2' }, params );
