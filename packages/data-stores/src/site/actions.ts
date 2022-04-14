import { Design } from '@automattic/design-picker/src/types';
import { wpcomRequest } from '../wpcom-request-controls';
import { SiteLaunchError } from './types';
import type { WpcomClientCredentials } from '../shared-types';
import type {
	CreateSiteParams,
	NewSiteErrorResponse,
	NewSiteSuccessResponse,
	SiteDetails,
	SiteError,
	Cart,
	Domain,
	SiteLaunchError as SiteLaunchErrorType,
	SiteSettings,
} from './types';

export function createActions( clientCreds: WpcomClientCredentials ) {
	const fetchSite = () => ( {
		type: 'FETCH_SITE' as const,
	} );

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

			const newSite: NewSiteSuccessResponse = yield wpcomRequest( {
				path: '/sites/new',
				apiVersion: '1.1',
				method: 'post',
				body: mergedParams,
				token: authToken,
			} );

			yield receiveNewSite( newSite );
			return true;
		} catch ( err ) {
			yield receiveNewSiteFailed( err as NewSiteErrorResponse );
			return false;
		}
	}

	const receiveSite = ( siteId: number, response: SiteDetails | undefined ) => ( {
		type: 'RECEIVE_SITE' as const,
		siteId,
		response,
	} );

	const receiveSiteTitle = ( siteId: number, name: string | undefined ) => ( {
		type: 'RECEIVE_SITE_TITLE' as const,
		siteId,
		name,
	} );

	const receiveSiteTagline = ( siteId: number, tagline: string | undefined ) => ( {
		type: 'RECEIVE_SITE_TAGLINE' as const,
		siteId,
		tagline,
	} );

	const receiveSiteVertical = ( siteId: number, vertical: string | undefined ) => ( {
		type: 'RECEIVE_SITE_VERTICAL' as const,
		siteId,
		vertical,
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

	const launchSiteStart = ( siteId: number ) => ( {
		type: 'LAUNCH_SITE_START' as const,
		siteId,
	} );

	const launchSiteSuccess = ( siteId: number ) => ( {
		type: 'LAUNCH_SITE_SUCCESS' as const,
		siteId,
	} );

	const launchSiteFailure = ( siteId: number, error: SiteLaunchErrorType ) => ( {
		type: 'LAUNCH_SITE_FAILURE' as const,
		siteId,
		error,
	} );

	function* launchSite( siteId: number ) {
		yield launchSiteStart( siteId );
		try {
			yield wpcomRequest( {
				path: `/sites/${ siteId }/launch`,
				apiVersion: '1.1',
				method: 'post',
			} );
			yield launchSiteSuccess( siteId );
		} catch ( _ ) {
			yield launchSiteFailure( siteId, SiteLaunchError.INTERNAL );
		}
	}

	// TODO: move getCart and setCart to a 'cart' data-store
	function* getCart( siteId: number ) {
		const success: Cart = yield wpcomRequest( {
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

	const receiveSiteSettings = ( siteId: number, settings: SiteSettings ) => ( {
		type: 'RECEIVE_SITE_SETTINGS' as const,
		siteId,
		settings,
	} );

	function* setCart( siteId: number, cartData: Cart ) {
		const success: Cart = yield wpcomRequest( {
			path: '/me/shopping-cart/' + siteId,
			apiVersion: '1.1',
			method: 'POST',
			body: cartData,
		} );
		return success;
	}

	function* saveSiteSettings(
		siteId: number,
		settings: {
			blogname?: string;
			blogdescription?: string;
			site_vertical?: string;
			woocommerce_onboarding_profile?: { [ key: string ]: any };
		}
	) {
		try {
			// extract this into its own function as a generic settings setter
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/settings`,
				apiVersion: '1.4',
				body: settings,
				method: 'POST',
			} );
			if ( 'blogname' in settings ) {
				yield receiveSiteTitle( siteId, settings.blogname );
			}
			if ( 'blogdescription' in settings ) {
				yield receiveSiteTagline( siteId, settings.blogdescription );
			}
			if ( 'site_vertical' in settings ) {
				yield receiveSiteVertical( siteId, settings.site_vertical );
			}
		} catch ( e ) {}
	}

	function* saveSiteTitle( siteId: number, blogname: string | undefined ) {
		yield saveSiteSettings( siteId, { blogname } );
	}

	function* saveSiteTagline( siteId: number, blogdescription: string | undefined ) {
		yield saveSiteSettings( siteId, { blogdescription } );
	}

	function* setDesignOnSite( siteSlug: string, selectedDesign: Design ) {
		yield wpcomRequest( {
			path: `/sites/${ siteSlug }/themes/mine`,
			apiVersion: '1.1',
			body: { theme: selectedDesign.theme, dont_change_homepage: true },
			method: 'POST',
		} );

		yield wpcomRequest( {
			path: `/sites/${ encodeURIComponent( siteSlug ) }/theme-setup`,
			apiNamespace: 'wpcom/v2',
			body: { trim_content: true },
			method: 'POST',
		} );

		const data: { is_fse_active: boolean } = yield wpcomRequest( {
			path: `/sites/${ siteSlug }/block-editor`,
			apiNamespace: 'wpcom/v2',
			method: 'GET',
		} );

		return data?.is_fse_active ?? false;
	}

	return {
		receiveSiteDomains,
		receiveSiteSettings,
		saveSiteTitle,
		saveSiteSettings,
		receiveSiteTitle,
		fetchNewSite,
		fetchSite,
		receiveNewSite,
		receiveNewSiteFailed,
		resetNewSiteFailed,
		setDesignOnSite,
		createSite,
		receiveSite,
		receiveSiteFailed,
		receiveSiteTagline,
		receiveSiteVertical,
		saveSiteTagline,
		reset,
		launchSite,
		launchSiteStart,
		launchSiteSuccess,
		launchSiteFailure,
		getCart,
		setCart,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'fetchNewSite' ]
			| ActionCreators[ 'fetchSite' ]
			| ActionCreators[ 'receiveSiteDomains' ]
			| ActionCreators[ 'receiveSiteSettings' ]
			| ActionCreators[ 'receiveNewSite' ]
			| ActionCreators[ 'receiveSiteTitle' ]
			| ActionCreators[ 'receiveNewSiteFailed' ]
			| ActionCreators[ 'receiveSiteTagline' ]
			| ActionCreators[ 'receiveSiteVertical' ]
			| ActionCreators[ 'receiveSite' ]
			| ActionCreators[ 'receiveSiteFailed' ]
			| ActionCreators[ 'reset' ]
			| ActionCreators[ 'resetNewSiteFailed' ]
			| ActionCreators[ 'launchSiteStart' ]
			| ActionCreators[ 'launchSiteSuccess' ]
			| ActionCreators[ 'launchSiteFailure' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
