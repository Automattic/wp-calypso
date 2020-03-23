/**
 * Internal dependencies
 */
import { CreateSiteParams, NewSiteErrorResponse, NewSiteSuccessResponse } from './types';
import { WpcomClientCredentials } from '../shared-types';
import { wpcomRequest } from '../wpcom-request-controls';

export function createActions( clientCreds: WpcomClientCredentials ) {
	const fetchNewSite = () => ( {
		type: 'FETCH_NEW_SITE' as const,
	} );

	const receiveNewSite = ( response: NewSiteSuccessResponse ) => ( {
		type: 'RECEIVE_NEW_SITE' as const,
		response,
	} );

	const receiveNewSiteFailed = ( error: NewSiteErrorResponse ) => ( {
		type: 'RECEIVE_NEW_SITE_FAILED' as const,
		error,
	} );

	function* createSite( params: CreateSiteParams ) {
		yield fetchNewSite();
		try {
			const { authToken, ...providedParams } = params;

			const defaultParams = {
				client_id: clientCreds.client_id,
				client_secret: clientCreds.client_secret,
				// will find an available `*.wordpress.com` url based on the `blog_name`
				find_available_url: true,
				// Private site is default, but overridable, setting
				public: -1,
			};

			const mergedParams = {
				...defaultParams,
				...providedParams,
				// Set to false because site validation should be a separate action
				validate: false,
			};

			const newSite = yield wpcomRequest( {
				path: '/sites/new',
				apiVersion: '1.1',
				method: 'post',
				body: mergedParams,
				token: authToken,
			} );

			yield receiveNewSite( newSite );
			return true;
		} catch ( err ) {
			yield receiveNewSiteFailed( err );
			return false;
		}
	}

	return {
		fetchNewSite,
		receiveNewSite,
		receiveNewSiteFailed,
		createSite,
	};
}

type ActionCreators = ReturnType< typeof createActions >;

export type Action = ReturnType<
	| ActionCreators[ 'fetchNewSite' ]
	| ActionCreators[ 'receiveNewSite' ]
	| ActionCreators[ 'receiveNewSiteFailed' ]
>;
