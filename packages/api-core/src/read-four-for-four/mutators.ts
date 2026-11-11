import { wpcom } from '../wpcom-fetcher';
import type {
	ReadFourForFourProgressParams,
	ReadFourForFourReviewResponse,
	ReadFourForFourStatusResponse,
} from './types';

/**
 * Record the candidate sites the user has subscribed to via
 * `POST /read/four-for-four/progress`. The server unions the IDs into the
 * user's followed list and marks the program completed once it holds four.
 */
export const recordReadFourForFourProgress = (
	params: ReadFourForFourProgressParams
): Promise< ReadFourForFourStatusResponse > =>
	wpcom.req.post( { path: '/read/four-for-four/progress', apiNamespace: 'wpcom/v2' }, params );

/**
 * Check that the writer's site is an English personal blog via
 * `POST /read/four-for-four/review`. The server reviews the site the user
 * opted in with, never one named in the request, and returns a stored verdict
 * without calling the model unless that verdict is `unchecked`. A new review
 * takes a few seconds.
 */
export const reviewReadFourForFourSite = (): Promise< ReadFourForFourReviewResponse > =>
	wpcom.req.post( { path: '/read/four-for-four/review', apiNamespace: 'wpcom/v2' } );
