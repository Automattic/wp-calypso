/**
 * Internal dependencies
 */
import type {
	CreateSiteParams,
	NewSiteErrorResponse,
	NewSiteSuccessResponse,
	SiteDetails,
	SiteError,
	Cart,
	Domain,
} from './types';
import type { WpcomClientCredentials } from '../shared-types';
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

	const receiveSite = ( siteId: number, response: SiteDetails | undefined ) => ( {
		type: 'RECEIVE_SITE' as const,
		siteId,
		response,
	} );

	const receiveSiteTitle = ( siteId: number, title: string ) => ( {
		type: 'RECEIVE_SITE_TITLE' as const,
		siteId,
		title,
	} );

	const receiveSiteFailed = ( siteId: number, response: SiteError | undefined ) => ( {
		type: 'RECEIVE_SITE_FAILED' as const,
		siteId,
		response,
	} );

	const reset = () => ( {
		type: 'RESET_SITE_STORE' as const,
	} );

	const resetNewSiteFailed = () => ( {
		type: 'RESET_RECEIVE_NEW_SITE_FAILED' as const,
	} );

	const launchedSite = ( siteId: number ) => ( {
		type: 'LAUNCHED_SITE' as const,
		siteId,
	} );

	function* launchSite( siteId: number ) {
		yield wpcomRequest( {
			path: `/sites/${ siteId }/launch`,
			apiVersion: '1.1',
			method: 'post',
		} );
		yield launchedSite( siteId );
		return true;
	}

	// TODO: move getCart and setCart to a 'cart' data-store
	function* getCart( siteId: number ) {
		const success = yield wpcomRequest( {
			path: '/me/shopping-cart/' + siteId,
			apiVersion: '1.1',
			method: 'GET',
		} );
		return success;
	}

	const receiveSiteDomains = ( siteId: number, domains: Domain[] ) => ( {
		type: 'RECEIVE_SITE_DOMAINS' as const,
		siteId,
		domains,
	} );

	function* setCart( siteId: number, cartData: Cart ) {
		const success = yield wpcomRequest( {
			path: '/me/shopping-cart/' + siteId,
			apiVersion: '1.1',
			method: 'POST',
			body: cartData,
		} );
		return success;
	}

	function* saveSiteTitle( siteId: number, title: string ) {
		try {
			// extract this into its own function as a generic settings setter
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/settings`,
				apiVersion: '1.4',
				body: { blogname: title },
				method: 'POST',
			} );
			yield receiveSiteTitle( siteId, title );
		} catch ( e ) {}
	}

	return {
		receiveSiteDomains,
		saveSiteTitle,
		receiveSiteTitle,
		fetchNewSite,
		receiveNewSite,
		receiveNewSiteFailed,
		resetNewSiteFailed,
		createSite,
		receiveSite,
		receiveSiteFailed,
		reset,
		launchSite,
		launchedSite,
		getCart,
		setCart,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'fetchNewSite' ]
			| ActionCreators[ 'receiveSiteDomains' ]
			| ActionCreators[ 'receiveNewSite' ]
			| ActionCreators[ 'receiveSiteTitle' ]
			| ActionCreators[ 'receiveNewSiteFailed' ]
			| ActionCreators[ 'receiveSite' ]
			| ActionCreators[ 'receiveSiteFailed' ]
			| ActionCreators[ 'reset' ]
			| ActionCreators[ 'resetNewSiteFailed' ]
			| ActionCreators[ 'launchedSite' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
