/**
 * Internal dependencies
 */
import {
	ActionType,
	CreateSiteParams,
	NewSiteErrorResponse,
	NewSiteSuccessResponse,
} from './types';

export const fetchNewSite = () => ( {
	type: ActionType.FETCH_NEW_SITE as const,
} );

export const receiveNewSite = ( response: NewSiteSuccessResponse ) => ( {
	type: ActionType.RECEIVE_NEW_SITE as const,
	response,
} );

export const receiveNewSiteFailed = ( error: NewSiteErrorResponse ) => ( {
	type: ActionType.RECEIVE_NEW_SITE_FAILED as const,
	error,
} );

export function* createSite( params: CreateSiteParams ) {
	yield fetchNewSite();
	try {
		const newUser = yield {
			type: ActionType.CREATE_SITE as const,
			params,
		};
		return receiveNewSite( newUser );
	} catch ( err ) {
		return receiveNewSiteFailed( err );
	}
}
